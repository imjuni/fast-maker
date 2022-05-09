import { IFastMakerYargsParameter } from '@cli/IFastMakerYargsParameter';
import * as path from 'path';
import { Argv } from 'yargs';

export default function builder(args: Argv<IFastMakerYargsParameter>): Argv<IFastMakerYargsParameter> {
  args
    .option('handler', {
      alias: 'h',
      description: 'API hander path',
      type: 'string',
    })
    .option('config', {
      alias: 'c',
      description: 'pass configuration file path, default value is cwd(current working directory)',
      type: 'string',
      default: path.join(process.cwd(), '.fastmakerrc'),
    })
    .option('project', {
      alias: 'p',
      description: 'tsconfig.json file for route.ts generation',
      type: 'string',
    })
    .option('verbose', {
      alias: 'v',
      description: 'display verbose message',
      type: 'boolean',
    })
    .demandOption(['project', 'handler']);

  return args;
}
