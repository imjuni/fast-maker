import type { CE_SEND_TO_PARENT_COMMAND } from '#worker/interface/CE_SEND_TO_PARENT_COMMAND';
import type ora from 'ora';

export default interface IFromChildDoSpinnerUpdate {
  command: typeof CE_SEND_TO_PARENT_COMMAND.SPINER_UPDATE;
  data: {
    message: string;
    type?: Extract<keyof ora.Ora, 'info' | 'fail' | 'warn' | 'succeed'>;
  };
}
