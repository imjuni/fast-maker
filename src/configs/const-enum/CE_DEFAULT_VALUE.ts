export const CE_DEFAULT_VALUE = {
  CONFIG_FILE_NAME: '.fastmakerrc',
  TSCONFIG_FILE_NAME: 'tsconfig.json',
  WATCH_DEFAULT_GLOB: '**/*.ts',
  TEMPLATES_PATH: 'templates',
  HANDLER_NAME: 'handler',
  OPTION_NAME: 'option',
  DEFAULT_TASK_WAIT_SECOND: 30,
} as const;

export type CE_DEFAULT_VALUE = (typeof CE_DEFAULT_VALUE)[keyof typeof CE_DEFAULT_VALUE];
