import type { CE_SEND_TO_PARENT_COMMAND } from '#worker/interface/CE_SEND_TO_PARENT_COMMAND';

export default interface IFromChildDoProgressStart {
  command: typeof CE_SEND_TO_PARENT_COMMAND.PROGRESS_START;
  data: {
    total: number;
    startValue: number;
  };
}
