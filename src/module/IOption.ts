export interface IOption {
  /**
   * path of the tsconfig file. Because fast-maker use typescript compiler api.
   */
  project: string;

  verbose?: boolean;

  path: {
    /**
     * path of the api handler
     */
    handler: string;

    /**
     * generated "route.ts" file on store this directory
     */
    output: string;
  };
}
