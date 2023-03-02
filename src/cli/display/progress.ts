import chalk from 'chalk';
import cliProgesss from 'cli-progress';

class Progress {
  accessor isEnable: boolean;

  #bar: cliProgesss.SingleBar;

  constructor() {
    this.isEnable = true;

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

  start(total: number, startValue: number, schemaName?: string) {
    if (this.isEnable) {
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
    if (this.isEnable) {
      this.#bar.stop();
    }
  }
}

const progress = new Progress();

export default progress;
