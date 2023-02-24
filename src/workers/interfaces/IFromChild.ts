import type { CE_SEND_TO_PARENT_COMMAND } from '#workers/interfaces/CE_SEND_TO_PARENT_COMMAND';
import type IFailDoWorkReply from '#workers/interfaces/IFailDoWorkReply';
import type IPassDoWorkReply from '#workers/interfaces/IPassDoWorkReply';
import type ora from 'ora';

interface IFromChildBase {
  command: CE_SEND_TO_PARENT_COMMAND;
  data: unknown;
}

export interface IFromChildDoProgressStart extends IFromChildBase {
  command: typeof CE_SEND_TO_PARENT_COMMAND.PROGRESS_START;
  data: {
    total: number;
    startValue: number;
  };
}

export interface IFromChildDoProgressIncrement extends IFromChildBase {
  command: typeof CE_SEND_TO_PARENT_COMMAND.PROGRESS_INCREMENT;
  data: {};
}

export interface IFromChildDoProgressUpdate extends IFromChildBase {
  command: typeof CE_SEND_TO_PARENT_COMMAND.PROGRESS_UPDATE;
  data: {
    updateValue: number;
  };
}

export interface IFromChildDoProgressStop extends IFromChildBase {
  command: typeof CE_SEND_TO_PARENT_COMMAND.PROGRESS_STOP;
  data: {};
}

export interface IFromChildDoSpinnerStart extends IFromChildBase {
  command: typeof CE_SEND_TO_PARENT_COMMAND.SPINER_START;
  data: {
    message?: string;
  };
}

export interface IFromChildDoSpinnerEnd extends IFromChildBase {
  command: typeof CE_SEND_TO_PARENT_COMMAND.SPINER_END;
  data: {};
}

export interface IFromChildDoSpinnerUpdate extends IFromChildBase {
  command: typeof CE_SEND_TO_PARENT_COMMAND.SPINER_UPDATE;
  data: {
    message: string;
    type?: Extract<keyof ora.Ora, 'info' | 'fail' | 'warn' | 'succeed'>;
  };
}

export interface IFromChildDoneDoInit extends IFromChildBase {
  command: typeof CE_SEND_TO_PARENT_COMMAND.DONE_DO_INIT;
  data: {};
}

export interface IFromChildDoneDoInitProject extends IFromChildBase {
  command: typeof CE_SEND_TO_PARENT_COMMAND.DONE_DO_INIT_PROJECT;
  data: {};
}

export interface IFromChildFailDoInitProject extends IFromChildBase {
  command: typeof CE_SEND_TO_PARENT_COMMAND.FAIL_DO_INIT_PROJECT;
  data: {
    err: Error;
  };
}

export interface IFromChildDoneDoStage01 extends IFromChildBase {
  command: typeof CE_SEND_TO_PARENT_COMMAND.DONE_DO_STAGE01;
  data: {
    handlers: number;
  };
}

export interface IFromChildFailDoStage01 extends IFromChildBase {
  command: typeof CE_SEND_TO_PARENT_COMMAND.FAIL_DO_STAGE01;
  data: {
    err: Error;
  };
}

export interface IFromChildDoneDoStage02 extends IFromChildBase {
  command: typeof CE_SEND_TO_PARENT_COMMAND.DONE_DO_STAGE02;
  data: {};
}

export interface IFromChildFailDoStage02 extends IFromChildBase {
  command: typeof CE_SEND_TO_PARENT_COMMAND.FAIL_DO_STAGE02;
  data: {
    err: Error;
  };
}

export interface IFromChildDoneDoStage03 extends IFromChildBase {
  command: typeof CE_SEND_TO_PARENT_COMMAND.DONE_DO_STAGE03;
  data: IPassDoWorkReply;
}

export interface IFromChildFailDoStage03 extends IFromChildBase {
  command: typeof CE_SEND_TO_PARENT_COMMAND.FAIL_DO_STAGE03;
  data: IFailDoWorkReply;
}

export type TFromChild =
  | IFromChildDoProgressStart
  | IFromChildDoProgressIncrement
  | IFromChildDoProgressUpdate
  | IFromChildDoProgressStop
  | IFromChildDoSpinnerStart
  | IFromChildDoSpinnerUpdate
  | IFromChildDoSpinnerEnd
  | IFromChildDoneDoInit
  | IFromChildDoneDoInitProject
  | IFromChildFailDoInitProject
  | IFromChildDoneDoStage01
  | IFromChildFailDoStage01
  | IFromChildDoneDoStage02
  | IFromChildFailDoStage02
  | IFromChildDoneDoStage03
  | IFromChildFailDoStage03;
