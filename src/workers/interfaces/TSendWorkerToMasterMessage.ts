import type IImportConfiguration from '#compilers/interfaces/IImportConfiguration';
import type IReason from '#compilers/interfaces/IReason';
import type { CE_ROUTE_INFO_KIND } from '#routes/interface/CE_ROUTE_INFO_KIND';
import type { CE_ROUTE_METHOD } from '#routes/interface/CE_ROUTE_METHOD';
import type IRouteConfiguration from '#routes/interface/IRouteConfiguration';
import type IRouteHandler from '#routes/interface/IRouteHandler';
import type { TPickRouteInfo } from '#routes/interface/TRouteInfo';
import type { CE_MASTER_ACTION } from '#workers/interfaces/CE_MASTER_ACTION';
import type { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';

export type TPassWorkerToMasterTaskComplete =
  | {
      command: typeof CE_WORKER_ACTION.SUMMARY_ROUTE_HANDLER_FILE;
      result: 'pass';
      id: number;
      data: Record<CE_ROUTE_METHOD, IRouteHandler[]>;
    }
  | {
      command: typeof CE_WORKER_ACTION.VALIDATE_ROUTE_HANDLER_FILE;
      result: 'pass';
      id: number;
      data: {
        invalid: TPickRouteInfo<typeof CE_ROUTE_INFO_KIND.ROUTE>[];
        valid: Record<CE_ROUTE_METHOD, TPickRouteInfo<typeof CE_ROUTE_INFO_KIND.ROUTE>[]>;
      };
    }
  | {
      command: typeof CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT;
      result: 'pass';
      id: number;
      data: {
        pass: {
          imports: IImportConfiguration[];
          routes: IRouteConfiguration[];
        };
        fail: {
          handler: IRouteHandler;
          reason: IReason;
        }[];
      };
    }
  | {
      command: typeof CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT_BULK;
      result: 'pass';
      id: number;
      data: {
        pass: {
          imports: IImportConfiguration[];
          routes: IRouteConfiguration[];
        };
        fail: {
          handler: IRouteHandler;
          reason: IReason;
        }[];
      };
    }
  | {
      command: CE_WORKER_ACTION;
      result: 'pass';
      id: number;
      data?: undefined;
    };

export type TPickPassWorkerToMasterTaskComplete<T> = Extract<TPassWorkerToMasterTaskComplete, { command: T }>;

export type TFailData =
  | {
      kind: 'error';
      message: string;
      stack?: string;
    }
  | {
      kind: 'error-with-reason';
      message: string;
      stack?: string;
      data: IReason[];
    }
  | {
      kind: 'state-machine-error';
      message: string;
      stack?: string;
      data: {
        handler: IRouteHandler;
        reason: IReason;
      }[];
    };

export interface IFailWorkerToMasterTaskComplete {
  command: CE_WORKER_ACTION;
  result: 'fail';
  id: number;
  // master/worker cannot send error class, send error message and stack
  error: TFailData;
}

export type TPickFailWorkerToMasterTaskComplete<T> = Extract<IFailWorkerToMasterTaskComplete, { command: T }>;

export function isPassTaskComplete(
  value: IFailWorkerToMasterTaskComplete | TPassWorkerToMasterTaskComplete,
): value is TPassWorkerToMasterTaskComplete {
  return value.result === 'pass';
}

export function isFailTaskComplete(
  value: IFailWorkerToMasterTaskComplete | TPassWorkerToMasterTaskComplete,
): value is IFailWorkerToMasterTaskComplete {
  return value.result === 'fail';
}

type TSendWorkerToMasterMessage =
  | {
      command: typeof CE_MASTER_ACTION.TASK_COMPLETE;
      data: IFailWorkerToMasterTaskComplete | TPassWorkerToMasterTaskComplete;
    }
  | {
      command: typeof CE_MASTER_ACTION.PROGRESS_UPDATE;
      data: {
        routeFile: string;
      };
    };

export default TSendWorkerToMasterMessage;
