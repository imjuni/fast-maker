import getHandlerWithOption from '#compilers/navigate/getHandlerWithOption';
import getTypeScriptProject from '#compilers/tools/getTypeScriptProject';
import getDiagnostics from '#compilers/validators/getDiagnostics';
import doAnalysisRequestStatement from '#modules/doAnalysisRequestStatement';
import doDedupeRouting from '#modules/doDedupeRouting';
import errorTrace from '#modules/errorTrace';
import getOutputFilePath from '#modules/getOutputFilePath';
import getValidRoutePath from '#modules/getValidRoutePath';
import summaryRouteHandlerFiles from '#modules/summaryRouteHandlerFiles';
import { CE_ROUTE_INFO_KIND } from '#routes/interface/CE_ROUTE_INFO_KIND';
import FastMakerContext from '#workers/FastMakerContext';
import { CE_MASTER_ACTION } from '#workers/interfaces/CE_MASTER_ACTION';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type { TPickSendMasterToWorkerMessage } from '#workers/interfaces/TSendMasterToWorkerMessage';
import type TSendWorkerToMasterMessage from '#workers/interfaces/TSendWorkerToMasterMessage';
import { findOrThrow, isError } from 'my-easy-fp';
import { isDescendant } from 'my-node-fp';
import type { TPickIFail, TPickIPass } from 'my-only-either';
import EventEmitter from 'node:events';
import type { AsyncReturnType } from 'type-fest';

export default class FastMakerEmitter extends EventEmitter {
  accessor id: number = 0;

  #context = new FastMakerContext();

  static terminate(this: void, code?: number) {
    process.exit(code ?? 0);
  }

  constructor(args?: { ee?: ConstructorParameters<typeof EventEmitter>[0] }) {
    super(args?.ee);

    if (process.listeners('SIGTERM').length <= 0) {
      process.on('SIGTERM', FastMakerEmitter.terminate);
    }

    this.on(
      CE_WORKER_ACTION.OPTION_LOAD,
      (payload: TPickSendMasterToWorkerMessage<typeof CE_WORKER_ACTION.OPTION_LOAD>['data']) => {
        this.loadOption(payload);
      },
    );

    this.on(CE_WORKER_ACTION.PROJECT_LOAD, () => {
      this.loadProject();
    });

    this.on(CE_WORKER_ACTION.PROJECT_DIAGONOSTIC, () => {
      this.diagonostic();
    });

    this.on(CE_WORKER_ACTION.SUMMARY_ROUTE_HANDLER_FILE, () => {
      this.summaryRouteHandlerFile().catch(errorTrace);
    });

    this.on(CE_WORKER_ACTION.VALIDATE_ROUTE_HANDLER_FILE, () => {
      this.validateRouteHandlerFile().catch(errorTrace);
    });

    this.on(
      CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT,
      (payload: TPickSendMasterToWorkerMessage<typeof CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT>['data']) => {
        this.analysisRequestStatement(payload).catch(errorTrace);
      },
    );

    this.on(
      CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT_BULK,
      (payload: TPickSendMasterToWorkerMessage<typeof CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT_BULK>['data']) => {
        this.analysisRequestStatementBulk(payload).catch(errorTrace);
      },
    );

    this.on(
      CE_WORKER_ACTION.TERMINATE,
      (payload: TPickSendMasterToWorkerMessage<typeof CE_WORKER_ACTION.TERMINATE>['data']) =>
        FastMakerEmitter.terminate(payload?.code),
    );
  }

  loadOption(payload: TPickSendMasterToWorkerMessage<typeof CE_WORKER_ACTION.OPTION_LOAD>['data']) {
    if (payload.option.kind === 'route') {
      this.#context.setOption({ kind: 'route', option: payload.option });
    } else {
      this.#context.setOption({ kind: 'watch', option: payload.option });
    }

    process.send?.({
      command: CE_MASTER_ACTION.TASK_COMPLETE,
      data: { id: this.id, result: 'pass', command: CE_WORKER_ACTION.OPTION_LOAD },
    } satisfies Extract<TSendWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>);
  }

  loadProject() {
    try {
      const project = getTypeScriptProject(this.#context.option.project);

      this.#context.project = project;

      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          command: CE_WORKER_ACTION.PROJECT_LOAD,
          id: this.id,
          result: 'pass',
        },
      } satisfies TSendWorkerToMasterMessage);
    } catch (caught) {
      const err = isError(caught, new Error('unknown error raised worker: loadProject'));
      // send message to master process
      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          command: CE_WORKER_ACTION.PROJECT_LOAD,
          id: this.id,
          result: 'fail',
          error: { kind: 'error', message: err.message, stack: err.stack },
        },
      } satisfies TSendWorkerToMasterMessage);

      process.exit(1);
    }
  }

  diagonostic() {
    try {
      if (getDiagnostics({ option: this.#context.option, project: this.#context.project })) {
        process.send?.({
          command: CE_MASTER_ACTION.TASK_COMPLETE,
          data: {
            id: this.id,
            result: 'pass',
            command: CE_WORKER_ACTION.PROJECT_DIAGONOSTIC,
          },
        } satisfies Extract<TSendWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>);
      } else {
        throw new Error('project compile error: diagonostic fail');
      }
    } catch (caught) {
      const err = isError(caught, new Error('project compile error: diagonostic fail'));

      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          id: this.id,
          result: 'fail',
          command: CE_WORKER_ACTION.PROJECT_DIAGONOSTIC,
          error: { kind: 'error', message: err.message, stack: err.stack },
        },
      } satisfies Extract<TSendWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>);
    }
  }

  async summaryRouteHandlerFile() {
    try {
      const sourceFilePaths = this.#context.project
        .getSourceFiles()
        .map((sourceFile) => sourceFile)
        .filter((sourceFile) => isDescendant(this.#context.option.handler, sourceFile.getFilePath().toString()))
        .filter((sourceFile) => sourceFile.getFilePath().toString() !== getOutputFilePath(this.#context.option.output))
        .filter((sourceFile) => getHandlerWithOption(sourceFile).handler != null)
        .map((sourceFile) => sourceFile.getFilePath().toString());

      this.#context.handler = await summaryRouteHandlerFiles(sourceFilePaths, this.#context.option);

      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          id: this.id,
          result: 'pass',
          command: CE_WORKER_ACTION.SUMMARY_ROUTE_HANDLER_FILE,
        },
      } satisfies Extract<TSendWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>);
    } catch (caught) {
      const err = isError(caught, new Error('project compile error: summaryRouteHandlerFile fail'));

      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          id: this.id,
          result: 'fail',
          command: CE_WORKER_ACTION.SUMMARY_ROUTE_HANDLER_FILE,
          error: { kind: 'error', message: err.message, stack: err.stack },
        },
      } satisfies Extract<TSendWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>);
    }
  }

  async validateRouteHandlerFile() {
    try {
      const result = getValidRoutePath(this.#context.getHandler(CE_ROUTE_INFO_KIND.SUMMARY_ROUTE_HANDLER_FILE));
      this.#context.handler = result;

      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          id: this.id,
          result: 'pass',
          command: CE_WORKER_ACTION.VALIDATE_ROUTE_HANDLER_FILE,
          data: {
            invalid: result.invalid,
            valid: result.valid,
          },
        },
      } satisfies Extract<TSendWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>);
    } catch (caught) {
      const err = isError(caught, new Error('project compile error: validateRouteHandlerFile fail'));

      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          id: this.id,
          result: 'fail',
          command: CE_WORKER_ACTION.VALIDATE_ROUTE_HANDLER_FILE,
          error: { kind: 'error', message: err.message, stack: err.stack },
        },
      } satisfies Extract<TSendWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>);
    }
  }

  async analysisRequestStatement(
    payload: TPickSendMasterToWorkerMessage<typeof CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT>['data'],
  ) {
    try {
      const validated = this.#context.getHandler(CE_ROUTE_INFO_KIND.VALIDATE_ROUTE_HANDLER_FILE);

      const handler = findOrThrow(
        Object.values(validated.valid).flat(),
        (validHandler) => validHandler.filePath === payload.filePath,
      );

      const statement = await doAnalysisRequestStatement(this.#context.project, this.#context.option, handler);

      process.send?.({
        command: CE_MASTER_ACTION.PROGRESS_UPDATE,
        data: {
          routeFile: handler.routePath,
        },
      } satisfies Extract<TSendWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.PROGRESS_UPDATE }>);

      if (statement.type === 'fail') {
        process.send?.({
          command: CE_MASTER_ACTION.TASK_COMPLETE,
          data: {
            id: this.id,
            result: 'pass',
            command: CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT,
            data: {
              pass: {
                imports: [],
                routes: [],
              },
              fail: [
                {
                  handler: statement.fail.handler,
                  reason: statement.fail.reason,
                },
              ],
            },
          },
        } satisfies Extract<TSendWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>);
      } else {
        process.send?.({
          command: CE_MASTER_ACTION.TASK_COMPLETE,
          data: {
            id: this.id,
            result: 'pass',
            command: CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT,
            data: {
              pass: doDedupeRouting([statement.pass]),
              fail: statement.pass.reasons,
            },
          },
        } satisfies Extract<TSendWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>);
      }
    } catch (caught) {
      const err = isError(caught, new Error('project compile error: validateRouteHandlerFile fail'));

      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          id: this.id,
          result: 'fail',
          command: CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT,
          error: { kind: 'error', message: err.message, stack: err.stack },
        },
      } satisfies Extract<TSendWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>);
    }
  }

  async analysisRequestStatementBulk(
    payload: TPickSendMasterToWorkerMessage<typeof CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT_BULK>['data'],
  ) {
    try {
      const validated = this.#context.getHandler(CE_ROUTE_INFO_KIND.VALIDATE_ROUTE_HANDLER_FILE);

      const handlers = Object.values(validated.valid)
        .flat()
        .filter((validHandler) => payload.filePaths.includes(validHandler.filePath));

      const statements = await Promise.all(
        handlers.map(async (handler) => {
          const statement = doAnalysisRequestStatement(this.#context.project, this.#context.option, handler);

          process.send?.({
            command: CE_MASTER_ACTION.PROGRESS_UPDATE,
            data: {
              routeFile: handler.routePath,
            },
          } satisfies Extract<TSendWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.PROGRESS_UPDATE }>);

          return statement;
        }),
      );

      const passes = statements
        .filter(
          (statement): statement is TPickIPass<AsyncReturnType<typeof doAnalysisRequestStatement>> =>
            statement.type === 'pass',
        )
        .map((statement) => statement.pass);

      const failes = statements
        .filter(
          (statement): statement is TPickIFail<AsyncReturnType<typeof doAnalysisRequestStatement>> =>
            statement.type === 'fail',
        )
        .map((statement) => statement.fail);

      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          id: this.id,
          result: 'pass',
          command: CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT_BULK,
          data: {
            pass: doDedupeRouting(passes),
            fail: [
              ...passes.map((passReply) => passReply.reasons).flat(),
              ...failes.map((error) => ({ handler: error.handler, reason: error.reason })),
            ],
          },
        },
      } satisfies Extract<TSendWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>);
    } catch (caught) {
      const err = isError(caught, new Error('project compile error: validateRouteHandlerFile fail'));

      process.send?.({
        command: CE_MASTER_ACTION.TASK_COMPLETE,
        data: {
          id: this.id,
          result: 'fail',
          command: CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT,
          error: { kind: 'error', message: err.message, stack: err.stack },
        },
      } satisfies Extract<TSendWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>);
    }
  }
}
