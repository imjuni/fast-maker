import progress from '#cli/display/progress';
import show from '#cli/display/show';
import spinner from '#cli/display/spinner';
import type IReason from '#compilers/interfaces/IReason';
import getResolvedPaths from '#configs/getResolvedPaths';
import type { TRouteBaseOption, TRouteOption } from '#configs/interfaces/TRouteOption';
import FastMakerError from '#errors/FastMakerError';
import importCodeGenerator from '#generators/importCodeGenerator';
import prettierProcessing from '#generators/prettierProcessing';
import routeCodeGenerator from '#generators/routeCodeGenerator';
import createAnalysisRequestStatementBulkCommand from '#modules/createAnalysisRequestStatementBulkCommand';
import getOutputFilePath from '#modules/getOutputFilePath';
import getRoutingCode from '#modules/getRoutingCode';
import mergeAnalysisRequestStatements from '#modules/mergeAnalysisRequestStatements';
import reasons from '#modules/reasons';
import writeOutputFile from '#modules/writeOutputFile';
import sortRoutePaths from '#routes/sortRoutePaths';
import getReasonMessages from '#tools/getReasonMessages';
import logger from '#tools/logger';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type TSendMasterToWorkerMessage from '#workers/interfaces/TSendMasterToWorkerMessage';
import {
  isFailTaskComplete,
  type TPickPassWorkerToMasterTaskComplete,
} from '#workers/interfaces/TSendWorkerToMasterMessage';
import workers from '#workers/workers';
import { showLogo } from '@maeum/cli-logo';
import chalk from 'chalk';
import { atOrThrow, isError, populate } from 'my-easy-fp';
import cluster from 'node:cluster';
import os from 'node:os';

const log = logger();

export default async function routeCommandClusterHandler(baseOption: TRouteBaseOption) {
  try {
    if (baseOption.cliLogo) {
      await showLogo({
        message: 'Fast Maker',
        figlet: { font: 'ANSI Shadow', width: 80 },
        color: 'cyan',
      });
    } else {
      spinner.start('Fast Maker start');
      spinner.update('Fast Maker start', 'info');
      spinner.stop();
    }

    const resolvedPaths = getResolvedPaths(baseOption);
    const option: TRouteOption = { ...baseOption, ...resolvedPaths, kind: 'route' };

    // slant, star wars, ansi shadow
    const workerSize = option.maxWorkers ?? os.cpus().length - 1;
    populate(workerSize).forEach(() => workers.add(cluster.fork()));

    log.trace(`cwd: ${resolvedPaths.cwd}/${resolvedPaths.project}`);
    log.trace(`${JSON.stringify(option)}`);
    log.trace(`worker-size: ${workerSize}`);

    spinner.start(`TypeScript project: ${resolvedPaths.project} loading, ...`);

    workers.broadcast({
      command: CE_WORKER_ACTION.OPTION_LOAD,
      data: { option },
    } satisfies Extract<TSendMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.OPTION_LOAD }>);

    await workers.wait();

    workers.broadcast({
      command: CE_WORKER_ACTION.PROJECT_LOAD,
    } satisfies Extract<TSendMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.PROJECT_LOAD }>);

    let reply = await workers.wait(option.workerTimeout);

    await workers.wait();

    // master check project loading on worker
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw new FastMakerError(failReply.error);
    }

    spinner.update(`TypeScript project: ${resolvedPaths.project} complete!`, 'succeed');

    workers.send({
      command: CE_WORKER_ACTION.PROJECT_DIAGONOSTIC,
    } satisfies Extract<TSendMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.PROJECT_DIAGONOSTIC }>);

    reply = await workers.wait();

    // master check project diagostic on worker
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw new FastMakerError(failReply.error);
    }

    workers.broadcast({
      command: CE_WORKER_ACTION.SUMMARY_ROUTE_HANDLER_FILE,
    } satisfies Extract<TSendMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.SUMMARY_ROUTE_HANDLER_FILE }>);

    reply = await workers.wait();

    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw new FastMakerError(failReply.error);
    }

    workers.broadcast({
      command: CE_WORKER_ACTION.VALIDATE_ROUTE_HANDLER_FILE,
    } satisfies Extract<TSendMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.VALIDATE_ROUTE_HANDLER_FILE }>);

    reply = await workers.wait();

    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw new FastMakerError(failReply.error);
    }

    const { data: validation } = atOrThrow(reply.data, 0) as TPickPassWorkerToMasterTaskComplete<
      typeof CE_WORKER_ACTION.VALIDATE_ROUTE_HANDLER_FILE
    >;

    const handlers = Object.values(validation.valid).flat();
    const job = createAnalysisRequestStatementBulkCommand(workerSize, handlers);

    workers.send(...job);

    progress.start(handlers.length, 0);

    reply = await workers.wait(option.workerTimeout);

    progress.update(handlers.length);
    progress.stop();

    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw new FastMakerError(failReply.error);
    }

    spinner.start('route.ts code generation');

    const data = reply.data as TPickPassWorkerToMasterTaskComplete<
      typeof CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT
    >[];

    if (data.length > 0) {
      const merged = mergeAnalysisRequestStatements(data.map((record) => record.data.pass));
      const routeCodes = routeCodeGenerator({ routeConfigurations: sortRoutePaths(merged.routes) });
      const importCodes = importCodeGenerator({ importConfigurations: merged.imports, option });
      const code = getRoutingCode({ option, imports: importCodes, routes: routeCodes });
      const prettfied = await prettierProcessing({ code });
      const outputFilePath = getOutputFilePath(option.output);
      await writeOutputFile(outputFilePath, prettfied);

      reasons.clear();
      reasons.add(
        ...[
          ...validation.invalid.map(
            (duplicate) =>
              ({
                type: 'error',
                message: `Found duplicated routePath(${chalk.red(`[${duplicate.method}] ${duplicate.routePath}`)}): ${
                  duplicate.filePath
                }`,
                filePath: duplicate.filePath,
              } satisfies IReason),
          ),
          ...data
            .map((failReply) => failReply.data.fail)
            .flat()
            .map((failReply) => failReply.reason),
        ],
      );

      show('log', getReasonMessages(reasons.reasons));
    } else {
      reasons.add(
        ...[
          ...validation.invalid.map(
            (duplicate) =>
              ({
                type: 'error',
                message: `Found duplicated routePath(${chalk.red(`[${duplicate.method}] ${duplicate.routePath}`)}): ${
                  duplicate.filePath
                }`,
                filePath: duplicate.filePath,
              } satisfies IReason),
          ),
          ...data
            .map((failReply) => failReply.data.fail)
            .flat()
            .map((failReply) => failReply.reason),
        ],
      );

      show('log', getReasonMessages(reasons.reasons));
    }

    spinner.update('route.ts code generation', 'succeed');

    log.debug('every worker thread terminate');

    workers.broadcast({ command: CE_WORKER_ACTION.TERMINATE } satisfies Extract<
      TSendMasterToWorkerMessage,
      { command: typeof CE_WORKER_ACTION.TERMINATE }
    >);

    return true;
  } catch (caught) {
    const err = isError(caught) ?? new Error('unknown error raised');

    log.debug(err.message);
    log.debug(err.stack);

    return false;
  } finally {
    workers.broadcast({ command: CE_WORKER_ACTION.TERMINATE } satisfies Extract<
      TSendMasterToWorkerMessage,
      { command: typeof CE_WORKER_ACTION.TERMINATE }
    >);
  }
}
