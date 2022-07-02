import cliProgesss from 'cli-progress';
import { isFalse } from 'my-easy-fp';

class Progress {
  private _enable: boolean;

  private _bar: cliProgesss.SingleBar;

  constructor() {
    this._enable = true;
    this._bar = new cliProgesss.SingleBar(
      {
        format: 'PROGRESS | {bar} | {value}/{total} Files',
        barCompleteChar: '\u25A0',
        barIncompleteChar: ' ',
        stopOnComplete: true,
      },
      cliProgesss.Presets.rect,
    );
  }

  get enable(): boolean {
    return this._enable;
  }

  set enable(enable) {
    this._enable = enable;
  }

  start(total: number, startValue: number) {
    if (isFalse(this._enable)) {
      return;
    }

    this._bar.start(total, startValue);
  }

  increment() {
    if (isFalse(this._enable)) {
      return;
    }

    this._bar.increment();
  }

  update(updateValue: number) {
    if (isFalse(this._enable)) {
      return;
    }

    this._bar.update(updateValue);
  }

  stop() {
    this._bar.stop();
  }
}

const progress = new Progress();

export default progress;
