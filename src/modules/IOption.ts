export interface IOption {
  path: {
    /**
     * path of the api handler
     */
    api: string;

    /**
     * path of the next.js page prefetch handler
     */
    page?: string;

    /**
     * generated "route.ts" file on store this directory
     */
    output: string;

    /**
     * path of the tsconfig file. Because fast-maker use typescript compiler api.
     */
    tsconfig: string;
  };

  /**
   * template of route.ts
   */
  template?: {
    /** api route template */
    api?: {
      import?: {
        async: string;
        sync: string;
        all: string;
      };

      wrapper?: {
        async: string;
        sync: string;
      };
    };

    page?: {
      import?: {
        async: string;
        sync: string;
        all: string;
      };

      wrapper?: {
        async: string;
        sync: string;
      };
    };
  };
}
