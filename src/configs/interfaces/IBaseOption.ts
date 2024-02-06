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

  /** path of the template files. */
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
   * A list of files to use when generating the index.ts file.
   * If no value is set, the value of the include setting
   * set in the tsconfig.json file will be used
   */
  include: string[];

  /**
   * A list of files to exclude when generating the index.ts file.
   * If no value is set, the Use the value of the exclude setting
   * set in the tsconfig.json file
   */
  exclude: string[];

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
