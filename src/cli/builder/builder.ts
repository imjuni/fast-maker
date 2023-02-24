import type IConfig from '#configs/interfaces/IConfig';
import type { Argv } from 'yargs';

export default function builder(args: Argv<IConfig>): Argv<IConfig> {
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
      default: false,
    })
    .option('useDefaultExport', {
      description: 'route function in output file that use default export',
      type: 'boolean',
      default: true,
    })
    .option('routeFunctionName', {
      description: 'rotue function name',
      type: 'string',
      default: 'routing',
    })
    .demandOption(['handler']);

  return args;
}
