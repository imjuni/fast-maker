import { CE_SEND_TO_PARENT_COMMAND } from '#worker/interface/CE_SEND_TO_PARENT_COMMAND';
import type { IFromChildDoProgressStart } from '#worker/interface/IFromChild';
import cliProgesss from 'cli-progress';

class Progress {
  accessor enable: boolean;

  accessor cluster: boolean;

  #bar: cliProgesss.SingleBar;

  constructor() {
    this.enable = true;
    this.cluster = false;

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
    if (this.cluster && this.enable) {
      process.send?.({
        command: CE_SEND_TO_PARENT_COMMAND.PROGRESS_START,
        data: { total, startValue },
      } satisfies IFromChildDoProgressStart);
    } else if (this.enable === true) {
      this.forceStart(total, startValue);
    }
  }

  forceStart(total: number, startValue: number) {
    this.#bar.start(total, startValue);
  }

  increment() {
    if (this.cluster && this.enable) {
      process.send?.({ command: CE_SEND_TO_PARENT_COMMAND.PROGRESS_INCREMENT });
    } else if (this.enable) {
      this.forceIncrement();
    }
  }

  forceIncrement() {
    this.#bar.increment();
  }

  update(updateValue: number) {
    if (this.cluster && this.enable) {
      process.send?.({ command: CE_SEND_TO_PARENT_COMMAND.PROGRESS_UPDATE, data: { updateValue } });
    } else if (this.enable) {
      this.forceUpdate(updateValue);
    }
  }

  forceUpdate(updateValue: number) {
    this.#bar.update(updateValue);
  }

  stop() {
    if (this.cluster) {
      process.send?.({ command: CE_SEND_TO_PARENT_COMMAND.PROGRESS_STOP });
    }
    this.forceStop();
  }

  forceStop() {
    this.#bar.stop();
  }
}

const progress = new Progress();

export default progress;
