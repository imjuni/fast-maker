import { builder } from '#/cli/builders/builder';
import { routeBuilder } from '#/cli/builders/routeBuilder';
import { initCommandSyncHandler } from '#/cli/commands/initCommandSyncHandler';
import { routeCommandSyncHandler } from '#/cli/commands/routeCommandSyncHandler';
import { Progress } from '#/cli/display/Progress';
import { Spinner } from '#/cli/display/Spinner';
import { CE_COMMAND_LIST } from '#/cli/interfaces/CE_COMMAND_LIST';
import { CE_STREAM_TYPE } from '#/cli/interfaces/CE_STREAM_TYPE';
import type { TRouteOption } from '#/configs/interfaces/TRouteOption';
import { isValidConfig } from '#/configs/isValidConfig';
import { preLoadConfig } from '#/configs/preLoadConfig';
import consola from 'consola';
import { isError } from 'my-easy-fp';
import yargs, { type CommandModule } from 'yargs';

const initCmd: CommandModule = {
  command: CE_COMMAND_LIST.INIT,
  aliases: CE_COMMAND_LIST.INIT_ALIAS,
  describe: 'create route.ts file in your directory using by tsconfig.json',
  handler: async () => {
    try {
      await initCommandSyncHandler();
    } catch (caught) {
      const err = isError(caught, new Error('unknown error raised'));
      consola.error(err);
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
      Spinner.bootstrap(CE_STREAM_TYPE.STDOUT, true);
      Progress.bootstrap(CE_STREAM_TYPE.STDOUT, true);

      await routeCommandSyncHandler(argv);
    } catch (caught) {
      const err = isError(caught, new Error('unknown error raised'));
      consola.error(err);
    }
  },
};

// const watchCmd: CommandModule<TWatchOption, TWatchOption> = {
//   command: CE_COMMAND_LIST.WATCH,
//   aliases: CE_COMMAND_LIST.WATCH_ALIAS,
//   describe: 'watch for create route.ts file in your directory using by tsconfig.json',
//   builder: (argv) => watchBuilder(builder(argv)),
//   handler: async (argv) => {
//     try {
//       progress.isEnable = true;
//       spinner.isEnable = true;

//       if (process.env.SYNC_MODE === 'true') {
//         await watchCommandSyncHandler(argv);
//       } else {
//         await watchCommandClusterHandler(argv);
//       }
//     } catch (caught) {
//       const err = isError(caught, new Error('unknown error raised'));
//       consola.error(err);
//     }
//   },
// };

const parser = yargs(process.argv.slice(2));

parser
  .command(routeCmd as CommandModule<object, TRouteOption>)
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
  consola.error(err.message);
  consola.error(err.stack);

  process.exit(1);
});
