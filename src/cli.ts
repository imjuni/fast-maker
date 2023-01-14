import builder from '#cli/builder/builder';
import watchBuilder from '#cli/builder/watchBuilder';
import routeCommandHandler from '#cli/command/routeCommandHandler';
import watchCommandHandler from '#cli/command/watchCommandHandler';
import type IConfig from '#config/interface/IConfig';
import type IWatchConfig from '#config/interface/IWatchConfig';
import isValidConfig from '#config/isValidConfig';
import preLoadConfig from '#config/preLoadConfig';
import logger from '#module/logging/logger';
import worker from '#worker/child';
import getIsPrimary from '#xstate/tool/getIsPrimary';
import { isError } from 'my-easy-fp';
import yargsAnyType, { type Arguments, type Argv, type CommandModule } from 'yargs';

const yargs: Argv<IConfig> = yargsAnyType as any;
const log = logger();

const routeCmd: CommandModule<IConfig, IConfig> = {
  command: 'route',
  describe: 'create route.ts file in your directory using by tsconfig.json',
  builder,
  handler: async (args) => {
    try {
      await routeCommandHandler(args);
    } catch (catched) {
      const err = isError(catched) ?? new Error('unknown error raised');
      log.error(err);
    }
  },
};

const watchCmd: CommandModule<IConfig & IWatchConfig, IConfig & IWatchConfig> = {
  command: 'watch',
  describe: 'watch for create route.ts file in your directory using by tsconfig.json',
  builder: (args) => {
    return [builder, watchBuilder].reduce((nextArgs, currentBuilder) => {
      return currentBuilder(nextArgs);
    }, args as any);
  },
  handler: async (args: Arguments<IConfig & IWatchConfig>) => {
    try {
      watchCommandHandler(args);
    } catch (catched) {
      const err = isError(catched) ?? Error('unknown error raised');
      log.error(err);
    }
  },
};

if (process.env.SYNC_MODE === 'true') {
  // eslint-disable-next-line
  yargs(process.argv.slice(2))
    .command<IConfig>(routeCmd)
    .command<IConfig & IWatchConfig>(watchCmd as any)
    .demandCommand()
    .recommendCommands()
    .config(preLoadConfig())
    .check(isValidConfig)
    .help().argv;
} else if (getIsPrimary()) {
  // eslint-disable-next-line
  yargs(process.argv.slice(2))
    .command<IConfig>(routeCmd)
    .command<IConfig & IWatchConfig>(watchCmd as any)
    .demandCommand()
    .recommendCommands()
    .config(preLoadConfig())
    .check(isValidConfig)
    .help().argv;
} else {
  worker();
}
