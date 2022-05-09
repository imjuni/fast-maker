import builder from '@cli/builder';
import { IFastMakerYargsParameter } from '@cli/IFastMakerYargsParameter';
import getTsconfigPath from '@compiler/tool/getTsconfigPath';
import { CliUx } from '@oclif/core';
import getProcessedConfig from '@tool/getProcessedConfig';
import messageDisplay from '@tool/messageDisplay';
import preLoadConfig from '@tool/preLoadConfig';
import consola, { LogLevel } from 'consola';
import * as fs from 'fs';
import { isFail } from 'my-only-either';
import * as path from 'path';
import yargsAnyType, { Arguments, Argv } from 'yargs';
import generator from './generator';

const version = '0.0.1';
consola.level = LogLevel.Success;

// Yargs default type using object type(= {}). But object type cause error that
// fast-maker cli option interface type. So we make concrete type yargs instance
// make using by any type.
const yargs: Argv<IFastMakerYargsParameter> = yargsAnyType as any;
// const enableCliUx = isFalse(process.env.DISABLE_CLIUX === 'off');

// eslint-disable-next-line
const argv = yargs(process.argv.slice(2))
  .command<IFastMakerYargsParameter>({
    aliases: '$0 [cwds...]',
    command: 'route [cwds...]',
    describe: 'create route.ts file in your directory using by tsconfig.json',
    builder,
    handler: async (args: Arguments<IFastMakerYargsParameter>) => {
      try {
        if (process.env.ENABLE_DEBUG_LOG === 'on') {
          consola.level = LogLevel.Debug;
        } else if (args.verbose) {
          consola.level = LogLevel.Log;
        }

        CliUx.ux.action.start('fast-maker start to route configuration generate', 'start');

        const tsconfigPath = await getTsconfigPath(args.project);

        if (isFail(tsconfigPath)) {
          throw tsconfigPath.fail;
        }

        CliUx.ux.action.status = `found tsconfig.json: ${tsconfigPath.pass}`;

        const optionEither = await getProcessedConfig({ args, project: tsconfigPath.pass });

        if (isFail(optionEither)) {
          throw optionEither.fail;
        }

        const generatedCodeEither = await generator(optionEither.pass);

        if (isFail(generatedCodeEither)) {
          throw generatedCodeEither.fail;
        }

        await fs.promises.writeFile(
          path.join(optionEither.pass.path.output, 'route.ts'),
          generatedCodeEither.pass.code,
        );

        messageDisplay(generatedCodeEither.pass.reasons);

        // /CliUx.ux.action.stop('complete!');
      } catch (catched) {
        const err = catched instanceof Error ? catched : new Error('unknown error raised');
        consola.error(err);

        CliUx.ux.action.stop('error!');
      }
    },
  })
  .version(version, 'version', 'display version information')
  .config(preLoadConfig())
  .help().argv;

consola.debug('argv: ', argv);
