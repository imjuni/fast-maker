export const CE_DEFAULT_VALUE = {
  CONFIG_FILE_NAME: '.fastmakerrc',
  TSCONFIG_FILE_NAME: 'tsconfig.json',
  WATCH_DEFAULT_GLOB: '**/*.ts',
  DEFAULT_TASK_WAIT_SECOND: 30,
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_DEFAULT_VALUE = (typeof CE_DEFAULT_VALUE)[keyof typeof CE_DEFAULT_VALUE];
