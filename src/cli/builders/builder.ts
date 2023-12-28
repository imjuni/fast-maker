import { CE_DEFAULT_VALUE } from '#/configs/interfaces/CE_DEFAULT_VALUE';
import type { Argv } from 'yargs';

export default function builder(args: Argv): Argv {
  // ------------------------------------------------------------------------
  // with alias
  // ------------------------------------------------------------------------
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
    .option('output', {
      alias: 'o',
      description: 'generated "route.ts" file on store this directory',
      type: 'string',
    })
    .option('project', {
      alias: 'p',
      description: 'tsconfig.json file for route.ts generation',
      type: 'string',
    });

  // ------------------------------------------------------------------------
  // without alias
  // ------------------------------------------------------------------------
  args
    .option('cli-logo', {
      describe: 'display cli logo',
      type: 'boolean',
      default: false,
    })
    .option('route-map', {
      describe: 'create route-map source file',
      type: 'boolean',
      default: false,
    })
    .option('max-workers', {
      describe: 'max worker count',
      type: 'number',
      default: undefined,
    })
    .option('worker-timeout', {
      describe: 'route code generation worker timeout: default 90 seconds',
      type: 'number',
      default: CE_DEFAULT_VALUE.DEFAULT_TASK_WAIT_SECOND * 3,
    })
    .option('use-default-export', {
      description: 'route function in output file that use default export',
      type: 'boolean',
      default: true,
    })
    .option('route-function-name', {
      description: 'rotue function name',
      type: 'string',
      default: 'routing',
    })
    .option('skip-error', {
      describe: 'skip compile error on source file',
      type: 'boolean',
      default: true,
    })
    .demandOption(['handler']);

  return args;
}
