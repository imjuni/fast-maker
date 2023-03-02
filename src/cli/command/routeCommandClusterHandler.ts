import progress from '#cli/display/progress';
import show from '#cli/display/show';
import spinner from '#cli/display/spinner';
import type IBaseOption from '#configs/interfaces/IBaseOption';
import importCodeGenerator from '#generators/importCodeGenerator';
import prettierProcessing from '#generators/prettierProcessing';
import routeCodeGenerator from '#generators/routeCodeGenerator';
import getRoutingCode from '#modules/getRoutingCode';
import mergeStage03Result from '#modules/mergeStage03Result';
import reasons from '#modules/reasons';
import methods from '#routes/interface/methods';
import sortRoutePaths from '#routes/sortRoutePaths';
import getReasonMessages from '#tools/getReasonMessages';
import logger from '#tools/logging/logger';
import { CE_SEND_TO_CHILD_COMMAND } from '#workers/interfaces/CE_SEND_TO_CHILD_COMMAND';
import type {
  IFromParentDoInit,
  IFromParentDoInitProject,
  IFromParentDoStage01,
  IFromParentDoStage02,
  IFromParentDoStage03,
} from '#workers/interfaces/IFromParent';
import replyBox from '#workers/replyBox';
import workerBox from '#workers/workerBox';
import fs from 'fs';
import { first, isError, populate } from 'my-easy-fp';
import cluster from 'node:cluster';
import path from 'node:path';

const log = logger();

function checkChildrenError() {
  if (workerBox.errors.length > 0) {
    workerBox.errors.forEach((err) => {
      spinner.update(err.message, 'fail');
    });

    const firstError = first(workerBox.errors);
    throw firstError;
  }
}

export default async function routeCommandClusterHandler(config: IBaseOption) {
  try {
    progress.isEnable = true;
    spinner.isEnable = true;

    spinner.start('start route.ts file generation');

    await Promise.all(
      populate(methods.length).map(() => {
        return Promise.resolve(workerBox.add(cluster.fork()));
      }),
    );

    spinner.update(`load tsconfig.json: ${config.project}`);

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

    spinner.update(`load tsconfig.json: ${config.project}`, 'succeed');
    spinner.update('find handler files');

    workerBox.send(
      methods.map((method) => {
        return {
          command: CE_SEND_TO_CHILD_COMMAND.DO_STAGE01,
          data: { method },
        } satisfies IFromParentDoStage01;
      }),
    );

    await workerBox.wait();

    spinner.update('find handler files', 'succeed');
    progress.start(workerBox.handlers, 0);

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

    progress.update(workerBox.handlers);

    checkChildrenError();

    spinner.start('route.ts code generation');

    workerBox.send(
      methods.map(() => {
        return {
          command: CE_SEND_TO_CHILD_COMMAND.DO_STAGE03,
          data: {},
        } satisfies IFromParentDoStage03;
      }),
    );

    await workerBox.wait();

    spinner.update('route.ts code generation', 'succeed');

    checkChildrenError();

    workerBox.broadcast({ command: CE_SEND_TO_CHILD_COMMAND.TERMINATE, data: {} });

    log.debug('worker 스레드를 모두 종료시킴');

    const merged = mergeStage03Result(Object.values(replyBox.passBox).map((reply) => reply.pass.route));

    const sorted = sortRoutePaths(merged.routeConfigurations);
    const routeCodes = routeCodeGenerator({ routeConfigurations: sorted });
    const importCodes = importCodeGenerator({ importConfigurations: merged.importConfigurations, option: config });

    const code = getRoutingCode({
      config,
      imports: importCodes,
      routes: routeCodes,
    });

    const prettfied = await prettierProcessing({ code });

    await fs.promises.writeFile(path.join(config.output, 'route.ts'), prettfied);

    show(getReasonMessages(reasons.reasons));

    return true;
  } catch (catched) {
    const err = isError(catched) ?? new Error('unknown error raised');
    log.error(err.message);
    log.error(err.stack);

    workerBox.broadcast({ command: CE_SEND_TO_CHILD_COMMAND.TERMINATE, data: {} });

    spinner.update(err.message, 'fail');

    return false;
  } finally {
    spinner.stop();
    progress.stop();
  }
}
