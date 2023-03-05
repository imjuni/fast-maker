import chalk from 'chalk';
import cliProgesss from 'cli-progress';

class Progress {
  accessor isEnable: boolean;

  #isProgressing: boolean;

  #bar: cliProgesss.SingleBar;

  constructor() {
    this.isEnable = true;
    this.#isProgressing = false;

    this.#bar = new cliProgesss.SingleBar(
      {
        format: `PROGRESS | ${chalk.greenBright('{bar}')} | {value}/{total} Files {routeFile}`,
        barCompleteChar: '\u25A0',
        barIncompleteChar: '\u25A1',
        stopOnComplete: true,
        barGlue: '\u001b[37m',
      },
      cliProgesss.Presets.rect,
    );
  }

  get isProgressing() {
    return this.#isProgressing;
  }

  start(total: number, startValue: number, schemaName?: string) {
    if (this.isEnable) {
      this.#isProgressing = true;
      this.#bar.start(total, startValue, {
        schemaName: schemaName != null ? ` - ${schemaName}` : '',
      });
    }
  }

  increment(routeFile?: string) {
    if (this.isEnable) {
      this.#bar.increment(undefined, { routeFile: routeFile != null ? ` - ${routeFile}` : '' });
    }
  }

  update(updateValue: number, schemaName?: string) {
    if (this.isEnable) {
      this.#bar.update(updateValue, { schemaName: schemaName != null ? ` - ${schemaName}` : '' });
    }
  }

  stop() {
    if (this.isEnable === false) return;

    if (this.#isProgressing) {
      this.#bar.stop();
    }
  }
}

const progress = new Progress();

export default progress;
