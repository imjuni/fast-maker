import builder from '#cli/builder/builder';
import routeBuilder from '#cli/builder/routeBuilder';
import watchBuilder from '#cli/builder/watchBuilder';
import routeCommandClusterHandler from '#cli/command/routeCommandClusterHandler';
import routeCommandSyncHandler from '#cli/command/routeCommandSyncHandler';
import watchCommandHandler from '#cli/command/watchCommandHandler';
import progress from '#cli/display/progress';
import spinner from '#cli/display/spinner';
import type { TRouteOption } from '#configs/interfaces/TRouteOption';
import type { TWatchOption } from '#configs/interfaces/TWatchOption';
import isValidConfig from '#configs/isValidConfig';
import preLoadConfig from '#configs/preLoadConfig';
import logger from '#tools/logging/logger';
import worker from '#workers/worker';
import getIsPrimary from '#xstate/tools/getIsPrimary';
import { isError } from 'my-easy-fp';
import yargs, { type CommandModule } from 'yargs';

const log = logger();

const routeCmd: CommandModule<TRouteOption, TRouteOption> = {
  command: 'route',
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
  command: 'watch',
  describe: 'watch for create route.ts file in your directory using by tsconfig.json',
  builder: (argv) => watchBuilder(builder(argv)),
  handler: async (argv) => {
    try {
      await watchCommandHandler(argv);
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
