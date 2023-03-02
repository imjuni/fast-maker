import type IBaseOption from '#configs/interfaces/IBaseOption';
import type { CE_ROUTE_METHOD } from '#routes/interface/CE_ROUTE_METHOD';
import type { CE_SEND_TO_CHILD_COMMAND } from '#workers/interfaces/CE_SEND_TO_CHILD_COMMAND';

interface IFromParentBase {
  command: CE_SEND_TO_CHILD_COMMAND;
  data: unknown;
}

export interface IFromParentDoInit extends IFromParentBase {
  command: typeof CE_SEND_TO_CHILD_COMMAND.DO_INIT;
  data: {
    config: IBaseOption;
  };
}

export interface IFromParentDoInitProject extends IFromParentBase {
  command: typeof CE_SEND_TO_CHILD_COMMAND.DO_INIT_PROJECT;
  data: {};
}

export interface IFromParentDoStage01 extends IFromParentBase {
  command: typeof CE_SEND_TO_CHILD_COMMAND.DO_STAGE01;
  data: {
    method: CE_ROUTE_METHOD;
  };
}

export interface IFromParentDoStage02 extends IFromParentBase {
  command: typeof CE_SEND_TO_CHILD_COMMAND.DO_STAGE02;
  data: {};
}

export interface IFromParentDoStage03 extends IFromParentBase {
  command: typeof CE_SEND_TO_CHILD_COMMAND.DO_STAGE03;
  data: {};
}

export interface IFromParentDoTerminate extends IFromParentBase {
  command: typeof CE_SEND_TO_CHILD_COMMAND.TERMINATE;
  data: {};
}

export type TFromParent =
  | IFromParentDoInit
  | IFromParentDoInitProject
  | IFromParentDoStage01
  | IFromParentDoStage02
  | IFromParentDoStage03
  | IFromParentDoTerminate;
