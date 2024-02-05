import { CE_STREAM_TYPE } from '#/cli/interfaces/CE_STREAM_TYPE';
import chalk from 'chalk';
import cliProgesss from 'cli-progress';

export class Progress {
  static #it: Progress;

  static #isBootstrap = false;

  static get it(): Readonly<Progress> {
    return Progress.#it;
  }

  static bootstrap(stream?: CE_STREAM_TYPE, isEnable?: boolean) {
    if (Progress.#isBootstrap) {
      return;
    }

    Progress.#it = new Progress(stream ?? CE_STREAM_TYPE.STDERR, isEnable ?? false);
    Progress.#isBootstrap = true;
  }

  #isEnable: boolean;

  #isProgressing: boolean;

  #bar: cliProgesss.SingleBar;

  constructor(stream: CE_STREAM_TYPE, isEnable: boolean) {
    this.#isEnable = isEnable;
    this.#isProgressing = false;

    this.#bar = new cliProgesss.SingleBar(
      {
        format: `PROGRESS | ${chalk.greenBright('{bar}')} | {value}/{total} Files {routeFile}`,
        barCompleteChar: '\u25A0',
        barIncompleteChar: '\u25A1',
        stopOnComplete: true,
        barGlue: '\u001b[37m',
        stream: stream === CE_STREAM_TYPE.STDOUT ? process.stdout : process.stderr,
      },
      cliProgesss.Presets.rect,
    );
  }

  get isEnable() {
    return this.#isEnable;
  }

  set isEnable(value) {
    this.#isEnable = value;
  }

  get isProgressing() {
    return this.#isProgressing;
  }

  start(total: number, startValue: number, schemaName?: string) {
    if (this.#isEnable) {
      this.#isProgressing = true;
      this.#bar.start(total, startValue, {
        schemaName: schemaName != null ? ` - ${schemaName}` : '',
      });
    }
  }

  increment(routeFile?: string) {
    if (this.#isEnable) {
      this.#bar.increment(undefined, { routeFile: routeFile != null ? ` - ${routeFile}` : '' });
    }
  }

  update(updateValue: number, schemaName?: string) {
    if (this.isEnable) {
      this.#bar.update(updateValue, { schemaName: schemaName != null ? ` - ${schemaName}` : '' });
    }
  }

  stop() {
    if (this.#isEnable === false) return;

    if (this.#isProgressing) {
      this.#bar.stop();
    }
  }
}
