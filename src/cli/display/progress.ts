import cliProgesss from 'cli-progress';

class Progress {
  accessor enable: boolean;

  #bar: cliProgesss.SingleBar;

  constructor() {
    this.enable = true;
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

  start(total: number, startValue: number) {
    if (this.enable === true) {
      this.#bar.start(total, startValue);
    }
  }

  increment() {
    if (this.enable === true) {
      this.#bar.increment();
    }
  }

  update(updateValue: number) {
    if (this.enable === true) {
      this.#bar.update(updateValue);
    }
  }

  stop() {
    this.#bar.stop();
  }
}

const progress = new Progress();

export default progress;
