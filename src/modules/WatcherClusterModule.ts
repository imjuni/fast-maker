import show from '#/cli/display/show';
import spinner from '#/cli/display/spinner';
import type IReason from '#/compilers/interfaces/IReason';
import type { TWatchOption } from '#/configs/interfaces/TWatchOption';
import FastMakerError from '#/errors/FastMakerError';
import importCodeGenerator from '#/generators/importCodeGenerator';
import prettierProcessing from '#/generators/prettierProcessing';
import routeCodeGenerator from '#/generators/routeCodeGenerator';
import routeMapGenerator from '#/generators/routeMapGenerator';
import createAnalysisRequestStatementBulkCommand from '#/modules/createAnalysisRequestStatementBulkCommand';
import getOutputFilePath from '#/modules/getOutputFilePath';
import getOutputMapFilePath from '#/modules/getOutputMapFilePath';
import getRoutingCode from '#/modules/getRoutingCode';
import { CE_WATCH_EVENT } from '#/modules/interfaces/CE_WATCH_EVENT';
import type IUpdateEvent from '#/modules/interfaces/IUpdateEvent';
import type IWatchEvent from '#/modules/interfaces/IWatchEvent';
import mergeAnalysisRequestStatements from '#/modules/mergeAnalysisRequestStatements';
import reasons from '#/modules/reasons';
import writeOutputFile from '#/modules/writeOutputFile';
import getDuplicateRouteReason from '#/routes/getDuplicateRouteReason';
import type { CE_ROUTE_INFO_KIND } from '#/routes/interface/CE_ROUTE_INFO_KIND';
import type { TPickRouteInfo } from '#/routes/interface/TRouteInfo';
import sortRoutePaths from '#/routes/sortRoutePaths';
import getReasonMessages from '#/tools/getReasonMessages';
import { CE_WORKER_ACTION } from '#/workers/interfaces/CE_WORKER_ACTION';
import type TSendMasterToWorkerMessage from '#/workers/interfaces/TSendMasterToWorkerMessage';
import {
  isFailTaskComplete,
  isPassTaskComplete,
  type TFailData,
  type TPickPassWorkerToMasterTaskComplete,
} from '#/workers/interfaces/TSendWorkerToMasterMessage';
import workers from '#/workers/workers';
import chalk from 'chalk';
import fastCopy from 'fast-copy';
import { atOrThrow } from 'my-easy-fp';
import { exists } from 'my-node-fp';
import path from 'path';

export default class WatcherClusterModule {
  #option: TWatchOption;

  #workerSize: number;

  constructor(args: { option: TWatchOption; workerSize: number }) {
    this.#option = args.option;
    this.#workerSize = args.workerSize;
  }

  async bulk(events: IWatchEvent[]) {
    const summaries = events.reduce<Record<CE_WATCH_EVENT, Set<string>>>(
      (aggregation, event) => {
        return { ...aggregation, [event.kind]: aggregation[event.kind].add(event.filePath) };
      },
      {
        add: new Set<string>(),
        change: new Set<string>(),
        unlink: new Set<string>(),
      },
    );

    if (Array.from(summaries.add).length > 0) {
      show('log', `${chalk.greenBright('Add')} file: ${Array.from(summaries.add).join(', ')}`);
    }

    if (Array.from(summaries.change).length > 0) {
      show('log', `${chalk.blueBright('Change')} file: ${Array.from(summaries.change).join(', ')}`);
    }

    if (Array.from(summaries.unlink).length > 0) {
      show('log', `${chalk.redBright('Delete')} file: ${Array.from(summaries.unlink).join(', ')}`);
    }

    const summaryReasons = [
      ...(await Promise.all(
        Array.from(summaries.add).map((filePath) => this.add({ kind: CE_WATCH_EVENT.ADD, filePath })),
      )),
      ...(await Promise.all(
        Array.from(summaries.change).map((filePath) => this.change({ kind: CE_WATCH_EVENT.CHANGE, filePath })),
      )),
      ...(await Promise.all(
        Array.from(summaries.unlink).map((filePath) => this.unlink({ kind: CE_WATCH_EVENT.UNLINK, filePath })),
      )),
    ].flat();

    const reply = await this.generate();

    const dedupeReasons = Object.values(
      [...summaryReasons, ...reply.reasons].reduce<Record<string, IReason>>((aggregation, reason) => {
        return { ...aggregation, [`${reason.filePath}::${reason.type}`]: reason };
      }, {}),
    );

    reasons.add(...dedupeReasons);

    return { ...reply, reasons: dedupeReasons };
  }

  async generate(): Promise<TPickRouteInfo<typeof CE_ROUTE_INFO_KIND.ANALYSIS> & { reasons: IReason[] }> {
    spinner.start('handler file searching');

    workers.broadcast({
      command: CE_WORKER_ACTION.SUMMARY_ROUTE_HANDLER_FILE,
    } satisfies Extract<TSendMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.SUMMARY_ROUTE_HANDLER_FILE }>);

    let reply = await workers.wait();

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

    const job = createAnalysisRequestStatementBulkCommand(this.#workerSize, handlers);

    workers.send(...job);

    reply = await workers.wait(this.#option.workerTimeout);

    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const failReplies = reply.data.filter(isFailTaskComplete);
      const failReply = atOrThrow(failReplies, 0);
      throw new FastMakerError(failReply.error);
    }

    const data = reply.data.filter(isPassTaskComplete) as TPickPassWorkerToMasterTaskComplete<
      typeof CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT
    >[];

    const merged = mergeAnalysisRequestStatements(data.map((record) => record.data.pass));

    return {
      ...merged,
      reasons: [
        ...getDuplicateRouteReason(validation.invalid),
        ...data.map((passReply) => passReply.data.fail.map((reason) => reason.reason)).flat(),
      ],
    };
  }

  async write(statements: IUpdateEvent['statements']) {
    spinner.start('route.ts file creating');

    const sortedRoutes = sortRoutePaths(statements.routes);
    const routeCodes = routeCodeGenerator({ routeConfigurations: sortedRoutes });
    const importCodes = importCodeGenerator({
      importConfigurations: statements.imports,
      option: this.#option,
    });
    const code = getRoutingCode({ option: this.#option, imports: importCodes, routes: routeCodes });
    const prettfied = await prettierProcessing({ code });
    const outputFilePath = getOutputFilePath(this.#option.output);
    await writeOutputFile(outputFilePath, prettfied);

    if (this.#option.routeMap) {
      const routeMapCode = routeMapGenerator(sortedRoutes);
      const routeMapOutputFilePath = getOutputMapFilePath(this.#option.output);
      const prettfiedRouteMapCode = await prettierProcessing({ code: routeMapCode });
      await writeOutputFile(routeMapOutputFilePath, prettfiedRouteMapCode);
    }

    spinner.stop('route.ts file created', 'succeed');

    show('log', getReasonMessages(reasons.reasons));
    reasons.clear();
  }

  async add(event: IWatchEvent): Promise<IReason[]> {
    const option = fastCopy(this.#option);
    const resolved = path.join(option.cwd, event.filePath);

    if ((await exists(resolved)) === false) {
      return [{ type: 'error', message: 'Cannot found change source file', filePath: resolved }];
    }

    workers.broadcast({
      command: CE_WORKER_ACTION.WATCH_SOURCE_FILE_ADD,
      data: {
        kind: CE_WATCH_EVENT.ADD,
        filePath: event.filePath,
      },
    } satisfies Extract<TSendMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_ADD }>);

    const reply = await workers.wait(option.workerTimeout);

    await workers.wait();

    // master check project loading on worker
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const reasonReplies = reply.data
        .filter(isFailTaskComplete)
        .map((failReply) => failReply.error)
        .filter(
          (error): error is Extract<TFailData, { kind: 'error-with-reason' }> => error.kind === 'error-with-reason',
        )
        .map((error) => error.data)
        .flat();

      return reasonReplies;
    }

    return [];
  }

  async change(event: IWatchEvent): Promise<IReason[]> {
    const option = fastCopy(this.#option);
    const resolved = path.join(option.cwd, event.filePath);

    if ((await exists(resolved)) === false) {
      return [{ type: 'error', message: 'Cannot found change source file', filePath: resolved }];
    }

    workers.broadcast({
      command: CE_WORKER_ACTION.WATCH_SOURCE_FILE_CHANGE,
      data: {
        kind: CE_WATCH_EVENT.ADD,
        filePath: event.filePath,
      },
    } satisfies Extract<TSendMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_CHANGE }>);

    const reply = await workers.wait(option.workerTimeout);

    await workers.wait();

    // master check project loading on worker
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const reasonReplies = reply.data
        .filter(isFailTaskComplete)
        .map((failReply) => failReply.error)
        .filter(
          (error): error is Extract<TFailData, { kind: 'error-with-reason' }> => error.kind === 'error-with-reason',
        )
        .map((error) => error.data)
        .flat();

      return reasonReplies;
    }

    return [];
  }

  async unlink(event: IWatchEvent): Promise<IReason[]> {
    workers.broadcast({
      command: CE_WORKER_ACTION.WATCH_SOURCE_FILE_CHANGE,
      data: {
        kind: CE_WATCH_EVENT.ADD,
        filePath: event.filePath,
      },
    } satisfies Extract<TSendMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.WATCH_SOURCE_FILE_CHANGE }>);

    const reply = await workers.wait(this.#option.workerTimeout);

    await workers.wait();

    // master check project loading on worker
    if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
      const reasonReplies = reply.data
        .filter(isFailTaskComplete)
        .map((failReply) => failReply.error)
        .filter(
          (error): error is Extract<TFailData, { kind: 'error-with-reason' }> => error.kind === 'error-with-reason',
        )
        .map((error) => error.data)
        .flat();

      return reasonReplies;
    }

    return [];
  }
}
