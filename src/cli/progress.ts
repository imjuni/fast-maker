import cliProgesss from 'cli-progress';
import { isFalse } from 'my-easy-fp';

class Progress {
  #enable: boolean;

  #bar: cliProgesss.SingleBar;

  constructor() {
    this.#enable = true;
    this.#bar = new cliProgesss.SingleBar(
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
    return this.#enable;
  }

  set enable(enable) {
    this.#enable = enable;
  }

  start(total: number, startValue: number) {
    if (isFalse(this.#enable)) {
      return;
    }

    this.#bar.start(total, startValue);
  }

  increment() {
    if (isFalse(this.#enable)) {
      return;
    }

    this.#bar.increment();
  }

  update(updateValue: number) {
    if (isFalse(this.#enable)) {
      return;
    }

    this.#bar.update(updateValue);
  }

  stop() {
    this.#bar.stop();
  }
}

const progress = new Progress();

export default progress;
