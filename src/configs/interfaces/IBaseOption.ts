import type { CE_EXT_KIND } from '#/configs/const-enum/CE_EXT_KIND';

export interface IBaseOption {
  /** path of .fastmakerrc configuration file */
  config?: string;

  /** path of the api handler */
  handler: string;

  /** generated "route.ts" file on store this directory */
  output: string;

  /** path of the tsconfig file. Because fast-maker use typescript compiler api. */
  project: string;

  /** path of the tsconfig file. Because fast-maker use typescript compiler api. */
  templates: string;

  /** module, route file extensions processing style in route.ts */
  extKind: CE_EXT_KIND;

  /** skip compile error on project source file */
  skipError: boolean;

  /** display cli logo */
  cliLogo: boolean;

  /** create route-map source file */
  routeMap: boolean;

  /**
   * index.ts 파일을 생성할 때 사용할 파일의 목록입니다. 만약 아무런 값을 설정하지 않는다면
   * tsconfig.json 파일에 설정된 include 설정 값을 사용합니다
   */
  include: string[];

  /**
   * index.ts 파일을 생성할 때 제외할 파일의 목록입니다. 만약 아무런 값을 설정하지 않는다면
   * tsconfig.json 파일에 설정된 exclude 설정 값을 사용합니다
   */
  exclude: string[];

  /** max worker count */
  maxWorkers?: number;

  /** route code generation worker timeout: default 90 seconds */
  workerTimeout: number;

  /**
   * route function in output file that use default export
   * @default true
   *  */
  useDefaultExport: boolean;

  /**
   * rotue function name
   * @default routing
   */
  routeFunctionName: string;
}
