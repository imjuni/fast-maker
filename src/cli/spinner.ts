import { isFalse } from 'my-easy-fp';
import ora from 'ora';

class Spinner {
  #enable: boolean;

  #spinner: ora.Ora;

  constructor() {
    this.#enable = true;
    this.#spinner = ora();
  }

  get enable(): boolean {
    return this.#enable;
  }

  set enable(enable) {
    this.#enable = enable;
  }

  start() {
    if (isFalse(this.#enable)) {
      return;
    }

    this.#spinner.start();
  }

  update(message: string) {
    this.#spinner.text = message;
  }

  stop() {
    this.#spinner.stop();
  }
}

const spinner = new Spinner();

export default spinner;
