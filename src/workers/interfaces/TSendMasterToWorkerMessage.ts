import type { TRouteOption } from '#configs/interfaces/TRouteOption';
import type { TWatchOption } from '#configs/interfaces/TWatchOption';
import type { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';

type TSendMasterToWorkerMessage =
  | {
      command: typeof CE_WORKER_ACTION.OPTION_LOAD;
      data: { option: TRouteOption | TWatchOption };
    }
  | {
      command: typeof CE_WORKER_ACTION.PROJECT_LOAD;
    }
  | {
      command: typeof CE_WORKER_ACTION.PROJECT_DIAGONOSTIC;
    }
  | {
      command: typeof CE_WORKER_ACTION.SUMMARY_ROUTE_HANDLER_FILE;
    }
  | {
      command: typeof CE_WORKER_ACTION.VALIDATE_ROUTE_HANDLER_FILE;
    }
  | {
      command: typeof CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT;
      data: { filePath: string };
    }
  | {
      command: typeof CE_WORKER_ACTION.ANALYSIS_REQUEST_STATEMENT_BULK;
      data: { filePaths: string[] };
    }
  | {
      command: typeof CE_WORKER_ACTION.TERMINATE;
      data?: { code?: number };
    };

export type TPickSendMasterToWorkerMessage<T extends CE_WORKER_ACTION> = Extract<
  TSendMasterToWorkerMessage,
  { command: T }
>;

export default TSendMasterToWorkerMessage;
