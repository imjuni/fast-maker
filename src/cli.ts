import builder from '#cli/builder/builder';
import watchBuilder from '#cli/builder/watchBuilder';
import IConfig from '#config/interface/IConfig';
import IWatchConfig from '#config/interface/IWatchConfig';
import isValidConfig from '#config/isValidConfig';
import preLoadConfig from '#config/preLoadConfig';
import generateRouting from '#route/generateRouting';
import watchRouting from '#route/watchRouting';
import getReasonMessages from '#tool/getReasonMessages';
import logger from '#tool/logger';
import * as fs from 'fs';
import { isError } from 'my-easy-fp';
import { isFail } from 'my-only-either';
import * as path from 'path';
import yargsAnyType, { Arguments, Argv, CommandModule } from 'yargs';

const yargs: Argv<IConfig> = yargsAnyType as any;
const log = logger();

const routeCmd: CommandModule<IConfig, IConfig> = {
  command: 'route',
  describe: 'create route.ts file in your directory using by tsconfig.json',
  builder,
  handler: async (args) => {
    try {
      const generatedCode = await generateRouting(args, { message: true, spinner: true, progress: true });

      if (isFail(generatedCode)) {
        throw generatedCode.fail;
      }

      await fs.promises.writeFile(path.join(args.output, 'route.ts'), generatedCode.pass.code);

      console.log(getReasonMessages(generatedCode.pass.reasons));
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
    return [builder, watchBuilder].reduce((nextArgs, current) => {
      return current(nextArgs);
    }, args as any);
  },
  handler: async (args: Arguments<IConfig & IWatchConfig>) => {
    try {
      watchRouting(args);
    } catch (catched) {
      const err = isError(catched) ?? Error('unknown error raised');
      log.error(err);
    }
  },
};

// eslint-disable-next-line
yargs(process.argv.slice(2))
  .command<IConfig>(routeCmd)
  .command<IConfig & IWatchConfig>(watchCmd as any)
  .demandCommand()
  .recommendCommands()
  .config(preLoadConfig())
  .check(isValidConfig)
  .help().argv;
