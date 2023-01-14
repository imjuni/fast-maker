import { CE_SEND_TO_PARENT_COMMAND } from '#worker/interface/CE_SEND_TO_PARENT_COMMAND';
import type {
  IFromChildDoSpinnerEnd,
  IFromChildDoSpinnerStart,
  IFromChildDoSpinnerUpdate,
} from '#worker/interface/IFromChild';
import ora from 'ora';

class Spinner {
  accessor enable: boolean;

  accessor cluster: boolean;

  #spinner: ora.Ora;

  constructor() {
    this.enable = true;
    this.cluster = false;
    this.#spinner = ora();
  }

  start(message?: string) {
    if (this.cluster && this.enable) {
      process.send?.({
        command: CE_SEND_TO_PARENT_COMMAND.SPINER_START,
        data: { message },
      } satisfies IFromChildDoSpinnerStart);
    } else if (this.enable === true) {
      this.forceStart(message);
    }
  }

  forceStart(message?: string) {
    this.#spinner.start(message);
  }

  update(message: string, type?: Extract<keyof ora.Ora, 'info' | 'fail' | 'warn' | 'succeed'>) {
    if (this.cluster && this.enable) {
      process.send?.({
        command: CE_SEND_TO_PARENT_COMMAND.SPINER_UPDATE,
        data: {
          message,
          type,
        },
      } satisfies IFromChildDoSpinnerUpdate);
    } else if (this.enable === true) {
      this.forceUpdate(message, type);
    }
  }

  forceUpdate(message: string, type?: Extract<keyof ora.Ora, 'info' | 'fail' | 'warn' | 'succeed'>) {
    if (type == null) {
      this.#spinner.text = message;
    } else {
      this.#spinner[type](message);
    }
  }

  stop() {
    if (this.cluster && this.enable) {
      process.send?.({ command: CE_SEND_TO_PARENT_COMMAND.SPINER_END, data: {} } satisfies IFromChildDoSpinnerEnd);
    } else {
      this.forceStop();
    }
  }

  forceStop() {
    this.#spinner.stop();
  }
}

const spinner = new Spinner();

export default spinner;
