import type { CE_SEND_TO_CHILD_COMMAND } from '#worker/interface/CE_SEND_TO_CHILD_COMMAND';

export default interface IFromParentDoTerminate {
  command: typeof CE_SEND_TO_CHILD_COMMAND.TERMINATE;
  data: {};
}
