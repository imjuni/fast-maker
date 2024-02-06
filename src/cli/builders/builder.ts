import { CE_EXT_KIND } from '#/configs/const-enum/CE_EXT_KIND';
import type { Argv } from 'yargs';

export function builder(args: Argv): Argv {
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
    .option('banner', {
      describe: '생성된 파일에 배너와 시간을 추가합니다',
      type: 'boolean',
      default: false,
    })
    .option('templates', {
      description: '템플릿 파일 경로를 결정합니다',
      type: 'string',
    })
    .option('ext-kind', {
      describe: 'import 구문의 확장자 처리 방법을 결정합니다',
      type: 'string',
      choices: [
        CE_EXT_KIND.NONE,
        CE_EXT_KIND.KEEP,
        CE_EXT_KIND.JS,
        CE_EXT_KIND.CJS,
        CE_EXT_KIND.MJS,
        CE_EXT_KIND.TS,
        CE_EXT_KIND.CTS,
        CE_EXT_KIND.MTS,
      ],
      default: CE_EXT_KIND.NONE,
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
