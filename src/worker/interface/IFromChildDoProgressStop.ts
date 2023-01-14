import type { CE_SEND_TO_PARENT_COMMAND } from '#worker/interface/CE_SEND_TO_PARENT_COMMAND';

export default interface IFromChildDoProgressStop {
  command: typeof CE_SEND_TO_PARENT_COMMAND.PROGRESS_STOP;
  data: {};
}
