import ora from 'ora';

class Spinner {
  accessor enable: boolean;

  #spinner: ora.Ora;

  constructor() {
    this.enable = true;
    this.#spinner = ora();
  }

  start() {
    if (this.enable === false) {
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
