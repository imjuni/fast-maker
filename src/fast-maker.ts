import builder from '@cli/builder';
import extractor from '@cli/extractor';
import { IFastMakerYargsParameter } from '@cli/IFastMakerYargsParameter';
import readConfigFile from '@cli/readConfigFile';
import { IOption } from '@modules/IOption';
import ll from '@modules/ll';
import chalk from 'chalk';
import path from 'path';
import { Arguments, Argv, default as yargsAnyType } from 'yargs';
import { generator } from './generator';
import merge from '@cli/merge';

const log = ll(__filename);
const version = '0.0.1';

// Yargs default type using object type(= {}). But object type cause error that
// fast-maker cli option interface type. So we make concrete type yargs instance
// make using by any type.

// eslint-disable-next-line
const yargs: Argv<IFastMakerYargsParameter> = yargsAnyType as any;

const argv = yargs(process.argv.slice(2))
  .command<IFastMakerYargsParameter>({
    aliases: '$0 [cwds...]',
    command: 'generate [cwds...]',
    describe: 'create route.ts file in your directory using by tsconfig.json',
    builder,
    handler: async (args: Arguments<IFastMakerYargsParameter>) => {
      try {
        const cwd = process.cwd();

        const configFilePath = path.join(path.resolve(cwd), '.fastmakerrc');
        const optionFromConfigFile = await readConfigFile(configFilePath);
        const optionFromCliParameter: Partial<IOption> = extractor(args);

        log('parameter from: ', optionFromCliParameter, args);
        log('configfile from: ', optionFromConfigFile);

        const option = await merge(optionFromConfigFile, optionFromCliParameter);

        await generator(option);

        return true;
      } catch (err) {
        console.log(chalk.redBright('Error: ', err.message));
        log(err.stack);
        return false;
      }
    },
  })
  .version(version, 'version', 'display version information')
  .help().argv;

log(argv);
