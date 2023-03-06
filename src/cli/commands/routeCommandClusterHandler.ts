import createTable from '#cli/display/createTable';
import progress from '#cli/display/progress';
import show from '#cli/display/show';
import spinner from '#cli/display/spinner';
import getResolvedPaths from '#configs/getResolvedPaths';
import type { TRouteBaseOption, TRouteOption } from '#configs/interfaces/TRouteOption';
import FastMakerError from '#errors/FastMakerError';
import importCodeGenerator from '#generators/importCodeGenerator';
import prettierProcessing from '#generators/prettierProcessing';
import routeCodeGenerator from '#generators/routeCodeGenerator';
import routeMapGenerator from '#generators/routeMapGenerator';
import createAnalysisRequestStatementBulkCommand from '#modules/createAnalysisRequestStatementBulkCommand';
import getOutputFilePath from '#modules/getOutputFilePath';
import getOutputMapFilePath from '#modules/getOutputMapFilePath';
import getRoutingCode from '#modules/getRoutingCode';
import mergeAnalysisRequestStatements from '#modules/mergeAnalysisRequestStatements';
import reasons from '#modules/reasons';
import table from '#modules/table';
import writeOutputFile from '#modules/writeOutputFile';
import getDuplicateRouteReason from '#routes/getDuplicateRouteReason';
import sortRoutePaths from '#routes/sortRoutePaths';
import getReasonMessages from '#tools/getReasonMessages';
import logger from '#tools/logger';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type TSendMasterToWorkerMessage from '#workers/interfaces/TSendMasterToWorkerMessage';
import {
  isFailTaskComplete,
  isPassTaskComplete,
  type TPickPassWorkerToMasterTaskComplete,
} from '#workers/interfaces/TSendWorkerToMasterMessage';
import workers from '#workers/workers';
import { showLogo } from '@maeum/cli-logo';
import chalk from 'chalk';
import { atOrThrow, isError, populate, sleep } from 'my-easy-fp';
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
      spinner.stop('Fast Maker start', 'info');
      await sleep(50);
    }

    const resolvedPaths = getResolvedPaths(baseOption);
    const option: TRouteOption = { ...baseOption, ...resolvedPaths, kind: 'route' };

    // slant, star wars, ansi shadow
    const workerSize = option.maxWorkers ?? os.cpus().length - 1;
    populate(workerSize).forEach(() => workers.add(cluster.fork()));

    log.trace(`cwd: ${resolvedPaths.cwd}/${resolvedPaths.project}`);
    log.trace(`${JSON.stringify(option)}`);
    log.trace(`worker-size: ${workerSize}`);

    spinner.start(`TypeScript project loading: ${resolvedPaths.project}`);

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

    spinner.stop(`TypeScript project loaded: ${resolvedPaths.project}`, 'succeed');

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

    spinner.start('handler file searching');

    workers.broadcast({
      command: CE_WORKER_ACTION.SUMMARY_ROUTE_HANDLER_FILE,
    } satisfies Extract<TSendMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.SUMMARY_ROUTE_HANDLER_FILE }>);

    reply = await workers.wait();

    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw new FastMakerError(failReply.error);
    }

    const { data: handlerFiles } = atOrThrow(reply.data, 0) as TPickPassWorkerToMasterTaskComplete<
      typeof CE_WORKER_ACTION.SUMMARY_ROUTE_HANDLER_FILE
    >;

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
    const count = Object.values(validation.valid).reduce((sum, validHandlers) => sum + validHandlers.length, 0);

    spinner.stop(`handler file searched: ${chalk.cyanBright(count)}`, 'succeed');

    if (count <= 0) {
      throw new Error(`Cannot found valid route handler file: ${count}/ ${Object.values(handlerFiles).flat().length}`);
    }

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

    spinner.start(`${chalk.greenBright('route.ts')} code generating`);

    const data = reply.data.filter(isPassTaskComplete) as TPickPassWorkerToMasterTaskComplete<
      typeof CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT
    >[];

    reasons.add(...getDuplicateRouteReason(validation.invalid));

    if (data.length > 0) {
      const merged = mergeAnalysisRequestStatements(data.map((record) => record.data.pass));
      const sortedRoutes = sortRoutePaths(merged.routes);
      const routeCodes = routeCodeGenerator({ routeConfigurations: sortedRoutes });
      const importCodes = importCodeGenerator({ importConfigurations: merged.imports, option });
      const code = getRoutingCode({ option, imports: importCodes, routes: routeCodes });
      const prettfied = await prettierProcessing({ code });
      const outputFilePath = getOutputFilePath(option.output);
      await writeOutputFile(outputFilePath, prettfied);

      table.table = createTable(option, handlerFiles, sortedRoutes);

      if (option.routeMap) {
        const routeMapCode = routeMapGenerator(sortedRoutes);
        const routeMapOutputFilePath = getOutputMapFilePath(option.output);
        const prettfiedRouteMapCode = await prettierProcessing({ code: routeMapCode });
        await writeOutputFile(routeMapOutputFilePath, prettfiedRouteMapCode);
      }

      reasons.add(...data.map((passReply) => passReply.data.fail.map((reason) => reason.reason)).flat());
    }

    spinner.stop('route.ts code generation', 'succeed');

    show('log', getReasonMessages(reasons.reasons));

    if (table.table != null) {
      show('log', table.table.toString());
    }

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

    spinner.stop();
    progress.stop();
  }
}
