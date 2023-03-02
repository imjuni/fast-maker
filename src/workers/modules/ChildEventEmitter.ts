import type IImportConfiguration from '#compilers/interfaces/IImportConfiguration';
import getTypeScriptProject from '#compilers/tools/getTypeScriptProject';
import type IBaseOption from '#configs/interfaces/IBaseOption';
import doDedupeRouting from '#modules/doDedupeRouting';
import doMethodAggregator from '#modules/doMethodAggregator';
import doStateMachine from '#modules/doStateMachine';
import type { CE_ROUTE_METHOD } from '#routes/interface/CE_ROUTE_METHOD';
import type IRouteConfiguration from '#routes/interface/IRouteConfiguration';
import type IRouteHandler from '#routes/interface/IRouteHandler';
import LogBox from '#tools/logging/LogBox';
import logger from '#tools/logging/logger';
import { CE_SEND_TO_CHILD_COMMAND } from '#workers/interfaces/CE_SEND_TO_CHILD_COMMAND';
import { CE_SEND_TO_PARENT_COMMAND } from '#workers/interfaces/CE_SEND_TO_PARENT_COMMAND';
import type {
  IFromChildDoneDoInit,
  IFromChildDoneDoInitProject,
  IFromChildDoneDoStage01,
  IFromChildDoneDoStage02,
  IFromChildDoneDoStage03,
  IFromChildFailDoInitProject,
  IFromChildFailDoStage01,
  IFromChildFailDoStage02,
  IFromChildFailDoStage03,
} from '#workers/interfaces/IFromChild';
import type { IFromParentDoInit, IFromParentDoStage01 } from '#workers/interfaces/IFromParent';
import { isError } from 'my-easy-fp';
import EventEmitter from 'node:events';
import type { Project } from 'ts-morph';
import type { AsyncReturnType } from 'type-fest';

const log = logger();

export default class ChildEventEmitter extends EventEmitter {
  #config: IBaseOption | undefined;

  #project: Project | undefined;

  #method: CE_ROUTE_METHOD | undefined;

  #machined: AsyncReturnType<typeof doStateMachine>['result'] | undefined;

  #handlers: IRouteHandler[];

  #imports: IImportConfiguration[];

  #routes: IRouteConfiguration[];

  #log: LogBox;

  constructor() {
    super();

    this.#config = undefined;
    this.#project = undefined;
    this.#machined = undefined;
    this.#method = undefined;
    this.#handlers = [];
    this.#imports = [];
    this.#routes = [];
    this.#log = new LogBox();

    this.on(CE_SEND_TO_CHILD_COMMAND.DO_INIT, this.doInitHandler.bind(this));
    this.on(CE_SEND_TO_CHILD_COMMAND.DO_INIT_PROJECT, () => {
      this.doInitProjectHandler().catch((caught) => {
        const err = isError(caught, new Error('unknown error raised: doInitProjectHandler'));
        log.error(err.message);
        log.error(err.stack);
      });
    });

    this.on(CE_SEND_TO_CHILD_COMMAND.DO_STAGE01, (message: IFromParentDoStage01) => {
      this.doStage01(message).catch((caught) => {
        const err = isError(caught, new Error('unknown error raised: doStage01'));
        log.error(err.message);
        log.error(err.stack);
      });
    });

    this.on(CE_SEND_TO_CHILD_COMMAND.DO_STAGE02, () => {
      this.doStage02().catch((caught) => {
        const err = isError(caught, new Error('unknown error raised: doStage02'));
        log.error(err.message);
        log.error(err.stack);
      });
    });

    this.on(CE_SEND_TO_CHILD_COMMAND.DO_STAGE03, () => {
      this.doStage03().catch((caught) => {
        const err = isError(caught, new Error('unknown error raised: doStage02'));
        log.error(err.message);
        log.error(err.stack);
      });
    });
  }

  doInitHandler(message: IFromParentDoInit) {
    this.#config = message.data.config;
    this.#log.config = this.#config;

    log.debug(`프로젝트 초기화 성공적: ${JSON.stringify(this.#config)}`);

    process.send?.({
      command: CE_SEND_TO_PARENT_COMMAND.DONE_DO_INIT,
      data: {},
    } satisfies IFromChildDoneDoInit);
  }

  async doInitProjectHandler() {
    try {
      if (this.#config == null) {
        throw new Error('uninitialize child cluster');
      }

      log.debug(`프로젝트 로딩 시도적: ${this.#config.project}`);

      this.#project = await getTypeScriptProject(this.#config.project);

      log.debug(`프로젝트 로딩 성공적: ${this.#config.project}`);

      process.send?.({
        command: CE_SEND_TO_PARENT_COMMAND.DONE_DO_INIT_PROJECT,
        data: {},
      } satisfies IFromChildDoneDoInitProject);
    } catch (catched) {
      const err = isError(catched) ?? new Error('unknowned error raised');

      process.send?.({
        command: CE_SEND_TO_PARENT_COMMAND.FAIL_DO_INIT_PROJECT,
        data: { err },
      } satisfies IFromChildFailDoInitProject);
    }
  }

  async doStage01(message: IFromParentDoStage01) {
    try {
      if (this.#config == null) {
        throw new Error('uninitialize child cluster');
      }

      this.#method = message.data.method;

      const result = await doMethodAggregator(this.#config.handler, [message.data.method]);

      this.#handlers.push(...result);

      process.send?.({
        command: CE_SEND_TO_PARENT_COMMAND.DONE_DO_STAGE01,
        data: {
          handlers: result.length,
        },
      } satisfies IFromChildDoneDoStage01);
    } catch (catched) {
      const err = isError(catched) ?? new Error('unknowned error raised');

      process.send?.({
        command: CE_SEND_TO_PARENT_COMMAND.FAIL_DO_STAGE01,
        data: { err },
      } satisfies IFromChildFailDoStage01);
    }
  }

  async doStage02() {
    try {
      if (this.#config == null || this.#project == null) {
        throw new Error('uninitialize child cluster');
      }

      if (this.#handlers.length <= 0) {
        process.send?.({
          command: CE_SEND_TO_PARENT_COMMAND.DONE_DO_STAGE02,
          data: {},
        } satisfies IFromChildDoneDoStage02);

        return;
      }

      const {
        result,
        reasons: stage02Reasons,
        logObject: stage02Log,
      } = await doStateMachine(this.#project, this.#config, this.#handlers);

      this.#machined = result;

      this.#log.fileExists = stage02Log.fileExists ?? [];
      this.#log.fileNotFound = stage02Log.fileNotFound ?? [];
      this.#log.functionExists = stage02Log.functionExists ?? [];
      this.#log.functionNotFound = stage02Log.functionNotFound ?? [];
      this.#log.routePathDuplicate = stage02Log.routePathDuplicate ?? [];
      this.#log.routePathUnique = stage02Log.routePathUnique ?? [];

      this.#log.reasons.push(...stage02Reasons);

      process.send?.({
        command: CE_SEND_TO_PARENT_COMMAND.DONE_DO_STAGE02,
        data: {},
      } satisfies IFromChildDoneDoStage02);
    } catch (catched) {
      const err = isError(catched) ?? new Error('unknowned error raised');

      process.send?.({
        command: CE_SEND_TO_PARENT_COMMAND.FAIL_DO_STAGE02,
        data: { err },
      } satisfies IFromChildFailDoStage02);
    }
  }

  async doStage03() {
    if (this.#method == null) {
      throw new Error('uninitialize child cluster');
    }

    try {
      if (this.#config == null || this.#project == null) {
        throw new Error('uninitialize child cluster');
      }

      if (this.#handlers.length <= 0) {
        process.send?.({
          command: CE_SEND_TO_PARENT_COMMAND.DONE_DO_STAGE03,
          data: {
            type: 'pass',
            method: this.#method,
            pass: {
              route: { importConfigurations: [], routeConfigurations: [] },
              log: this.#log.toObject(),
            },
          },
        } satisfies IFromChildDoneDoStage03);

        return;
      }

      if (this.#machined == null) {
        throw new Error('uninitialize child cluster');
      }

      const { importConfigurations, routeConfigurations, reasons: stage03Reasons } = doDedupeRouting(this.#machined);

      this.#imports.push(...importConfigurations);
      this.#routes.push(...routeConfigurations);

      this.#log.importConfigurations = importConfigurations;
      this.#log.routeConfigurations = routeConfigurations;
      this.#log.reasons.push(...stage03Reasons);

      process.send?.({
        command: CE_SEND_TO_PARENT_COMMAND.DONE_DO_STAGE03,
        data: {
          type: 'pass',
          method: this.#method,
          pass: {
            route: { importConfigurations, routeConfigurations },
            log: this.#log.toObject(),
          },
        },
      } satisfies IFromChildDoneDoStage03);
    } catch (catched) {
      const err = isError(catched) ?? new Error('unknowned error raised');

      log.debug('왜 오류가 발생했지???');
      log.debug(err.message);
      log.debug(err.stack);

      process.send?.({
        command: CE_SEND_TO_PARENT_COMMAND.FAIL_DO_STAGE03,
        data: {
          type: 'fail',
          method: this.#method,
          log: this.#log.toObject(),
          err,
        },
      } satisfies IFromChildFailDoStage03);
    }
  }
}
