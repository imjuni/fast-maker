import progress from '#cli/display/progress';
import spinner from '#cli/display/spinner';
import type IConfig from '#config/interface/IConfig';
import prettierProcessing from '#generator/prettierProcessing';
import getRoutingCode from '#module/getRoutingCode';
import LogBox from '#module/logging/LogBox';
import logger from '#module/logging/logger';
import mergeStage03Result from '#module/mergeStage03Result';
import generateRouting from '#route/generateRouting';
import methods from '#route/interface/methods';
import getReasonMessages from '#tool/getReasonMessages';
import loseAbleStringfiy from '#tool/loseAbleStringfiy';
import { CE_SEND_TO_CHILD_COMMAND } from '#worker/interface/CE_SEND_TO_CHILD_COMMAND';
import type IFromParentDoWork from '#worker/interface/IFromParentDoWork';
import type IPassDoWorkReply from '#worker/interface/IPassDoWorkReply';
import replyBox from '#worker/replyBox';
import workerBox from '#worker/workerBox';
import fs from 'fs';
import { isError, populate } from 'my-easy-fp';
import { isFail } from 'my-only-either';
import cluster from 'node:cluster';
import os from 'node:os';
import path from 'node:path';

const log = logger();

export default async function routeCommandHandler(config: IConfig) {
  if (process.env.SYNC_MODE === 'true') {
    progress.enable = true;
    progress.cluster = false;

    spinner.enable = true;
    spinner.cluster = false;

    const routing = await generateRouting(config, methods);

    if (isFail(routing)) {
      if (config.debugLog != null && config.debugLog === false) {
        await fs.promises.writeFile('fast-maker.debug.info.log', routing.fail.log.toString());
      }

      throw routing.fail.err;
    }

    const code = getRoutingCode({
      config,
      imports: routing.pass.route.importCodes,
      routes: routing.pass.route.routeCodes,
    });

    const prettfiedEither = await prettierProcessing({ code });

    if (isFail(prettfiedEither)) {
      if (config.debugLog != null && config.debugLog === false) {
        await fs.promises.writeFile('fast-maker.debug.info.log', routing.pass.log.toString());
      }

      throw prettfiedEither.fail;
    }

    await fs.promises.writeFile(path.join(config.output, 'route.ts'), prettfiedEither.pass);

    console.log(getReasonMessages(routing.pass.log.reasons));

    progress.stop();
    spinner.stop();

    return true;
  }

  try {
    progress.enable = true;
    progress.cluster = true;

    spinner.enable = true;
    spinner.cluster = true;

    spinner.forceStart();

    await Promise.all(
      populate(os.cpus().length).map(() => {
        return Promise.resolve(workerBox.add(cluster.fork()));
      }),
    );

    workerBox.send(
      ...methods.map<IFromParentDoWork>((method) => {
        return { command: CE_SEND_TO_CHILD_COMMAND.DO_WORK, data: { config, method } };
      }),
    );

    await workerBox.wait();

    workerBox.broadcast({ command: CE_SEND_TO_CHILD_COMMAND.TERMINATE, data: {} });

    log.debug('worker 스레드를 모두 종료시킴');

    const failReasons = methods.map((method) => Object.values(replyBox.failBox[method] ?? {}).length > 0)
      ? LogBox.merge(
          ...Object.values(replyBox.failBox)
            .map((reply) => reply.fail.log)
            .filter((logbox): logbox is LogBox => logbox != null),
        ).reasons
      : [];

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

    const code = getRoutingCode({
      config,
      imports: merged.importCodes,
      routes: merged.routeCodes,
    });

    const prettfiedEither = await prettierProcessing({ code });

    if (isFail(prettfiedEither)) {
      if (config.debugLog != null && config.debugLog === false) {
        await fs.promises.writeFile('fast-maker.debug.info.log', loseAbleStringfiy(logbox));
      }

      throw prettfiedEither.fail;
    }

    await fs.promises.writeFile(path.join(config.output, 'route.ts'), prettfiedEither.pass);

    console.log(getReasonMessages([...failReasons, ...logbox.reasons]));

    spinner.forceStop();
    progress.forceStop();

    return true;
  } catch (catched) {
    const err = isError(catched) ?? new Error('unknown error raised');
    log.error(err.message);
    log.error(err.stack);

    workerBox.broadcast({ command: CE_SEND_TO_CHILD_COMMAND.TERMINATE, data: {} });
    return false;
  }
}
