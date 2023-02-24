import progress from '#cli/display/progress';
import spinner from '#cli/display/spinner';
import type IConfig from '#configs/interfaces/IConfig';
import importCodeGenerator from '#generators/importCodeGenerator';
import prettierProcessing from '#generators/prettierProcessing';
import routeCodeGenerator from '#generators/routeCodeGenerator';
import getRoutingCode from '#modules/getRoutingCode';
import mergeStage03Result from '#modules/mergeStage03Result';
import methods from '#routes/interface/methods';
import sortRoutePaths from '#routes/sortRoutePaths';
import getReasonMessages from '#tools/getReasonMessages';
import LogBox from '#tools/logging/LogBox';
import logger from '#tools/logging/logger';
import loseAbleStringfiy from '#tools/loseAbleStringfiy';
import { CE_SEND_TO_CHILD_COMMAND } from '#workers/interfaces/CE_SEND_TO_CHILD_COMMAND';
import type {
  IFromParentDoInit,
  IFromParentDoInitProject,
  IFromParentDoStage01,
  IFromParentDoStage02,
  IFromParentDoStage03,
} from '#workers/interfaces/IFromParent';
import type IPassDoWorkReply from '#workers/interfaces/IPassDoWorkReply';
import replyBox from '#workers/replyBox';
import workerBox from '#workers/workerBox';
import fs from 'fs';
import { first, isError, populate } from 'my-easy-fp';
import { isFail } from 'my-only-either';
import cluster from 'node:cluster';
import path from 'node:path';

const log = logger();

function checkChildrenError() {
  if (workerBox.errors.length > 0) {
    workerBox.errors.forEach((err) => {
      spinner.forceUpdate(err.message, 'fail');
    });

    const firstError = first(workerBox.errors);
    throw firstError;
  }
}

export default async function routeCommandClusterHandler(config: IConfig) {
  try {
    progress.enable = true;
    progress.cluster = true;

    spinner.enable = true;
    spinner.cluster = true;

    spinner.forceStart('start route.ts file generation');

    await Promise.all(
      populate(methods.length).map(() => {
        return Promise.resolve(workerBox.add(cluster.fork()));
      }),
    );

    spinner.forceUpdate(`load tsconfig.json: ${config.project}`);

    workerBox.send(
      methods.map(() => {
        return { command: CE_SEND_TO_CHILD_COMMAND.DO_INIT, data: { config } } satisfies IFromParentDoInit;
      }),
    );

    await workerBox.wait();

    workerBox.send(
      methods.map(() => {
        return {
          command: CE_SEND_TO_CHILD_COMMAND.DO_INIT_PROJECT,
          data: {},
        } satisfies IFromParentDoInitProject;
      }),
    );

    await workerBox.wait();

    checkChildrenError();

    spinner.forceUpdate(`load tsconfig.json: ${config.project}`, 'succeed');
    spinner.forceUpdate('find handler files');

    workerBox.send(
      methods.map((method) => {
        return {
          command: CE_SEND_TO_CHILD_COMMAND.DO_STAGE01,
          data: { method },
        } satisfies IFromParentDoStage01;
      }),
    );

    await workerBox.wait();

    spinner.forceUpdate('find handler files', 'succeed');
    progress.forceStart(workerBox.handlers, 0);

    checkChildrenError();

    workerBox.send(
      methods.map(() => {
        return {
          command: CE_SEND_TO_CHILD_COMMAND.DO_STAGE02,
          data: {},
        } satisfies IFromParentDoStage02;
      }),
    );

    await workerBox.wait();

    progress.forceUpdate(workerBox.handlers);

    checkChildrenError();

    spinner.forceStart('route.ts code generation');

    workerBox.send(
      methods.map(() => {
        return {
          command: CE_SEND_TO_CHILD_COMMAND.DO_STAGE03,
          data: {},
        } satisfies IFromParentDoStage03;
      }),
    );

    await workerBox.wait();

    spinner.forceUpdate('route.ts code generation', 'succeed');

    checkChildrenError();

    workerBox.broadcast({ command: CE_SEND_TO_CHILD_COMMAND.TERMINATE, data: {} });

    log.debug('worker 스레드를 모두 종료시킴');

    const merged = mergeStage03Result(
      Object.values(replyBox.passBox)
        .filter((reply): reply is IPassDoWorkReply => reply != null)
        .map((reply) => reply.pass.route),
    );

    const logbox = LogBox.merge(
      ...Object.values(replyBox.passBox)
        .filter((reply): reply is IPassDoWorkReply => reply != null)
        .map((reply) => reply.pass.log),
    );

    const sorted = sortRoutePaths(merged.routeConfigurations);
    const routeCodes = routeCodeGenerator({ routeConfigurations: sorted });
    const importCodes = importCodeGenerator({ importConfigurations: merged.importConfigurations, config });

    const code = getRoutingCode({
      config,
      imports: importCodes,
      routes: routeCodes,
    });

    const prettfiedEither = await prettierProcessing({ code });

    if (isFail(prettfiedEither)) {
      if (config.debugLog != null && config.debugLog === false) {
        await fs.promises.writeFile('fast-maker.debug.info.log', loseAbleStringfiy(logbox));
      }

      throw prettfiedEither.fail;
    }

    await fs.promises.writeFile(path.join(config.output, 'route.ts'), prettfiedEither.pass);

    // eslint-disable-next-line no-console
    console.log(getReasonMessages(logbox.reasons));

    return true;
  } catch (catched) {
    const err = isError(catched) ?? new Error('unknown error raised');
    log.error(err.message);
    log.error(err.stack);

    workerBox.broadcast({ command: CE_SEND_TO_CHILD_COMMAND.TERMINATE, data: {} });

    spinner.update(err.message, 'fail');

    return false;
  } finally {
    spinner.forceStop();
    progress.forceStop();
  }
}
