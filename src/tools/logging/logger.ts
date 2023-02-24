import chalk from 'chalk';
import pino, { type Logger } from 'pino';
import pretty from 'pino-pretty';

let log:
  | Logger<{
      browser: {
        asObject: true;
      };
      customLevels: {
        debug: number;
        verbose: number;
        info: number;
        warn: number;
        error: number;
      };
    }>
  | undefined;

export function getLogLevel(level: unknown): number {
  try {
    if (typeof level === 'number') {
      return level;
    }

    if (typeof level === 'string') {
      const parsed = Number.parseInt(level, 10);
      return parsed;
    }

    // level of debug
    return 20;
  } catch {
    // level of debug
    return 20;
  }
}

export default function logger() {
  if (log === undefined) {
    const stream = pretty({
      translateTime: 'yy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname',
      colorize: false,
      customPrettifiers: {
        level: (unknownLevel: unknown) => {
          const levelCode = getLogLevel(unknownLevel);
          const levelLabel = pino.levels.labels[levelCode]!.toLowerCase();

          switch (levelLabel) {
            case 'debug':
              return `${chalk.blueBright(pino.levels.labels[levelCode])}`;
            case 'info':
              return `${chalk.greenBright(pino.levels.labels[levelCode])}`;
            case 'warn':
              return `${chalk.yellowBright(pino.levels.labels[levelCode])}`;
            case 'error':
              return `${chalk.redBright(pino.levels.labels[levelCode])}`;
            default:
              return `${chalk.greenBright(pino.levels.labels[levelCode])}`;
          }
        },
      },
      sync: true,
    });

    log = pino(
      {
        browser: { asObject: true },

        customLevels: {
          trace: pino.levels.values.trace!,
          verbose: pino.levels.values.verbose!,
          debug: pino.levels.values.debug!,
          info: pino.levels.values.info!,
          warn: pino.levels.values.warn!,
          error: pino.levels.values.error!,
          fatal: pino.levels.values.fatal!,
        },
      },
      stream,
    );

    log.level = process.env.LOG_LEVEL ?? 'info';
  }

  return log;
}
