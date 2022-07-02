import configBuilder from '@cli/builder';
import watchBuilder from '@cli/watchBuilder';
import getConcreteConfig from '@config/getConcreteConfig';
import getConcreteWatchConfig from '@config/getConcreteWatchConfig';
import IConfig from '@config/interface/IConfig';
import IWatchConfig from '@config/interface/IWatchConfig';
import preLoadConfig from '@config/preLoadConfig';
import messageDisplay from '@tool/messageDisplay';
import consola, { LogLevel } from 'consola';
import * as fs from 'fs';
import { isError } from 'my-easy-fp';
import { isFail } from 'my-only-either';
import * as path from 'path';
import yargsAnyType, { Arguments, Argv } from 'yargs';
import { generateRouteFile, watchRouteFile } from './fast-maker';

const version = '0.0.1';
consola.level = LogLevel.Success;

// Yargs default type using object type(= {}). But object type cause error that
// fast-maker cli option interface type. So we make concrete type yargs instance
// make using by any type.
const yargs: Argv<IConfig> = yargsAnyType as any;

// eslint-disable-next-line
const argv = yargs(process.argv.slice(2))
  .command<IConfig>({
    command: 'route',
    describe: 'create route.ts file in your directory using by tsconfig.json',
    builder: configBuilder,
    handler: async (args: Arguments<Partial<IConfig>>) => {
      try {
        const config = getConcreteConfig(args);
        const generatedCode = await generateRouteFile(config, { message: true, spinner: true, progress: true });

        if (isFail(generatedCode)) {
          throw generatedCode.fail;
        }

        await fs.promises.writeFile(path.join(config.output, 'route.ts'), generatedCode.pass.code);

        messageDisplay(generatedCode.pass.reasons);
      } catch (catched) {
        const err = isError(catched) ?? Error('unknown error raised');
        consola.error(err);
      }
    },
  })
  .command<IConfig & IWatchConfig>({
    command: 'watch',
    describe: 'watch for create route.ts file in your directory using by tsconfig.json',
    builder: (args) => {
      return [configBuilder, watchBuilder].reduce((nextArgs, builder) => {
        return builder(nextArgs);
      }, args as any);
    },
    handler: async (args: Arguments<Partial<IConfig & IWatchConfig>>) => {
      try {
        const watchConfig = getConcreteWatchConfig(args);
        const baseConfig = getConcreteConfig(args);
        const config: IConfig & IWatchConfig = { ...baseConfig, ...watchConfig };

        watchRouteFile(config);
      } catch (catched) {
        const err = isError(catched) ?? Error('unknown error raised');
        consola.error(err);
      }
    },
  })
  .demandCommand()
  .recommendCommands()
  .version(version, 'version', 'display version information')
  .config(preLoadConfig())
  .help().argv;

consola.debug('argv: ', argv);
