import builder from '#cli/builders/builder';
import routeBuilder from '#cli/builders/routeBuilder';
import watchBuilder from '#cli/builders/watchBuilder';
import initCommandSyncHandler from '#cli/commands/initCommandSyncHandler';
import routeCommandClusterHandler from '#cli/commands/routeCommandClusterHandler';
import routeCommandSyncHandler from '#cli/commands/routeCommandSyncHandler';
import watchCommandClusterHandler from '#cli/commands/watchCommandClusterHandler';
import watchCommandSyncHandler from '#cli/commands/watchCommandSyncHandler';
import progress from '#cli/display/progress';
import spinner from '#cli/display/spinner';
import { CE_COMMAND_LIST } from '#cli/interfaces/CE_COMMAND_LIST';
import type { TRouteOption } from '#configs/interfaces/TRouteOption';
import type { TWatchOption } from '#configs/interfaces/TWatchOption';
import isValidConfig from '#configs/isValidConfig';
import preLoadConfig from '#configs/preLoadConfig';
import logger from '#tools/logger';
import worker from '#workers/worker';
import getIsPrimary from '#xstate/tools/getIsPrimary';
import { isError } from 'my-easy-fp';
import yargs, { type CommandModule } from 'yargs';

const log = logger();

const initCmd: CommandModule = {
  command: CE_COMMAND_LIST.INIT,
  aliases: CE_COMMAND_LIST.INIT_ALIAS,
  describe: 'create route.ts file in your directory using by tsconfig.json',
  handler: async () => {
    try {
      await initCommandSyncHandler();
    } catch (caught) {
      const err = isError(caught, new Error('unknown error raised'));
      log.error(err);
    }
  },
};

const routeCmd: CommandModule<TRouteOption, TRouteOption> = {
  command: CE_COMMAND_LIST.ROUTE,
  aliases: CE_COMMAND_LIST.ROUTE_ALIAS,
  describe: 'create route.ts file in your directory using by tsconfig.json',
  builder: (argv) => routeBuilder(builder(argv)),
  handler: async (argv) => {
    try {
      progress.isEnable = true;
      spinner.isEnable = true;

      if (process.env.SYNC_MODE === 'true') {
        await routeCommandSyncHandler(argv);
      } else {
        await routeCommandClusterHandler(argv);
      }
    } catch (caught) {
      const err = isError(caught, new Error('unknown error raised'));
      log.error(err);
    }
  },
};

const watchCmd: CommandModule<TWatchOption, TWatchOption> = {
  command: CE_COMMAND_LIST.WATCH,
  aliases: CE_COMMAND_LIST.WATCH_ALIAS,
  describe: 'watch for create route.ts file in your directory using by tsconfig.json',
  builder: (argv) => watchBuilder(builder(argv)),
  handler: async (argv) => {
    try {
      progress.isEnable = true;
      spinner.isEnable = true;

      if (process.env.SYNC_MODE === 'true') {
        await watchCommandSyncHandler(argv);
      } else {
        await watchCommandClusterHandler(argv);
      }
    } catch (caught) {
      const err = isError(caught, new Error('unknown error raised'));
      log.error(err);
    }
  },
};

if (process.env.SYNC_MODE === 'true') {
  const parser = yargs(process.argv.slice(2));

  parser
    .command(routeCmd as CommandModule<{}, TRouteOption>)
    .command(watchCmd as CommandModule<{}, TWatchOption>)
    .command(initCmd)
    .demandCommand()
    .recommendCommands()
    .config(preLoadConfig())
    .check(isValidConfig)
    .help();

  const handler = async () => {
    await parser.argv;
  };

  handler().catch((caught) => {
    const err = isError(caught, new Error('unknown error raised'));
    log.error(err.message);
    log.error(err.stack);

    process.exit(1);
  });
} else if (getIsPrimary()) {
  const parser = yargs(process.argv.slice(2));

  parser
    .command(routeCmd as CommandModule<{}, TRouteOption>)
    .command(watchCmd as CommandModule<{}, TWatchOption>)
    .command(initCmd)
    .demandCommand()
    .recommendCommands()
    .config(preLoadConfig())
    .check(isValidConfig)
    .help();

  const handler = async () => {
    await parser.argv;
  };

  handler().catch((caught) => {
    const err = isError(caught, new Error('unknown error raised'));
    log.error(err.message);
    log.error(err.stack);

    process.exit(1);
  });
} else {
  worker().catch((caught) => {
    const err = isError(caught, new Error('unknown error raised'));
    log.error(err.message);
    log.error(err.stack);

    process.exit(1);
  });
}
