import type { CE_SEND_TO_PARENT_COMMAND } from '#worker/interface/CE_SEND_TO_PARENT_COMMAND';

export default interface IFromChildDoProgressUpdate {
  command: typeof CE_SEND_TO_PARENT_COMMAND.PROGRESS_UPDATE;
  data: {
    updateValue: number;
  };
}
