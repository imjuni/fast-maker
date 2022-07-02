export default interface IConfig {
  /** path of .fastmakerrc configuration file */
  c?: string;
  config?: string;

  /** save extra log for debugging */
  debugLog: boolean;

  /** path of the api handler */
  h: string;
  handler: string;

  /** generated "route.ts" file on store this directory */
  o: string;
  output: string;

  /** path of the tsconfig file. Because fast-maker use typescript compiler api. */
  p: string;
  project: string;

  /** verbose message display */
  v: boolean;
  verbose: boolean;
}
