import type { CE_SEND_TO_PARENT_COMMAND } from '#worker/interface/CE_SEND_TO_PARENT_COMMAND';

export default interface IFromChildDoSpinnerStart {
  command: typeof CE_SEND_TO_PARENT_COMMAND.SPINER_START;
  data: {
    message?: string;
  };
}
