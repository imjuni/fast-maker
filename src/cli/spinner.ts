import { isFalse } from 'my-easy-fp';
import ora from 'ora';

class Spinner {
  private _enable: boolean;

  private _spinner: ora.Ora;

  constructor() {
    this._enable = true;
    this._spinner = ora();
  }

  get enable(): boolean {
    return this._enable;
  }

  set enable(enable) {
    this._enable = enable;
  }

  start() {
    if (isFalse(this._enable)) {
      return;
    }

    this._spinner.start();
  }

  update(message: string) {
    this._spinner.text = message;
  }

  stop() {
    this._spinner.stop();
  }
}

const spinner = new Spinner();

export default spinner;
