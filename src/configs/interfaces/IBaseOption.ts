export default interface IBaseOption {
  /** path of .fastmakerrc configuration file */
  config?: string;

  /** save extra log for debugging */
  debugLog: boolean;

  /** path of the api handler */
  handler: string;

  /** generated "route.ts" file on store this directory */
  output: string;

  /** path of the tsconfig file. Because fast-maker use typescript compiler api. */
  project: string;

  /** verbose message display */
  verbose: boolean;

  /** skip compile error on project source file */
  skipError: boolean;

  /** display cli logo */
  cliLogo: boolean;

  /** create route-map source file */
  routeMap: boolean;

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
