import { CE_STREAM_TYPE } from '#cli/interfaces/CE_STREAM_TYPE';
import ora from 'ora';

class Spinner {
  #spinner: ora.Ora;

  #stream: CE_STREAM_TYPE;

  accessor isEnable: boolean;

  constructor(stream?: CE_STREAM_TYPE) {
    this.#spinner = ora({ text: '', stream: process.stdout });
    this.isEnable = false;
    this.#stream = stream ?? CE_STREAM_TYPE.STDOUT;
  }

  set stream(value: CE_STREAM_TYPE) {
    if (value === this.#stream) {
      this.#spinner.stop();
      this.#spinner = ora({ text: this.#spinner.text });
    } else {
      this.#spinner.stop();
      this.#spinner = ora({
        text: this.#spinner.text,
        stream: value === CE_STREAM_TYPE.STDOUT ? process.stdout : process.stderr,
      });
      this.#stream = value;
    }
  }

  start(message?: string) {
    if (this.isEnable === false) return;

    if (message != null) {
      this.#spinner.start(message);
    } else {
      this.#spinner.start();
    }
  }

  static getColor(channel: keyof Pick<ora.Ora, 'succeed' | 'fail' | 'info'>): ora.Color {
    if (channel === 'fail') {
      return 'red';
    }

    if (channel === 'succeed') {
      return 'green';
    }

    return 'cyan';
  }

  update(message: string, channel?: keyof Pick<ora.Ora, 'succeed' | 'fail' | 'info'>) {
    if (this.isEnable === false) return;

    if (channel != null) {
      this.#spinner[channel](message);
    } else {
      setImmediate(() => {
        this.#spinner.text = message;
      });
    }
  }

  stop(display?: { message: string; channel: keyof Pick<ora.Ora, 'succeed' | 'fail' | 'info'> }) {
    if (this.isEnable === false) return;

    if (display != null) {
      this.#spinner[display.channel](display.message);
    } else {
      this.#spinner.stop();
    }
  }
}

const spinner = new Spinner();

export default spinner;
