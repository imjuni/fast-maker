import { CE_STREAM_TYPE } from '#/cli/interfaces/CE_STREAM_TYPE';
import ora from 'ora';

export class Spinner {
  static #it: Spinner;

  static #isBootstrap = false;

  static get it(): Readonly<Spinner> {
    return Spinner.#it;
  }

  static bootstrap(stream?: CE_STREAM_TYPE, isEnable?: boolean) {
    if (Spinner.#isBootstrap) {
      return;
    }

    Spinner.#it = new Spinner(stream ?? CE_STREAM_TYPE.STDOUT, isEnable ?? false);
    Spinner.#isBootstrap = true;
  }

  #spinner: ora.Ora;

  #stream: CE_STREAM_TYPE;

  accessor isEnable: boolean;

  constructor(stream: CE_STREAM_TYPE, isEnable: boolean) {
    this.#spinner = ora({ text: '', stream: stream === CE_STREAM_TYPE.STDOUT ? process.stdout : process.stderr });
    this.isEnable = isEnable;
    this.#stream = stream;
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

  stop(message?: string, channel?: keyof Pick<ora.Ora, 'succeed' | 'fail' | 'info'>) {
    if (this.isEnable === false) return;

    if (message != null && channel != null) {
      this.#spinner[channel](message);
    }

    if (message != null) {
      setImmediate(() => {
        this.#spinner.text = message;
      });
    }

    if (this.#spinner.isSpinning) {
      this.#spinner.stop();
    }
  }
}
