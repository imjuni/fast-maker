export const CE_COMMAND_LIST = {
  ADD: 'add',
  DEL: 'del',
  REFRESH: 'refresh',
  TRUNCATE: 'truncate',
  INIT: 'init',
  WATCH: 'watch',
  ADD_ALIAS: 'a',
  DEL_ALIAS: 'd',
  REFRESH_ALIAS: 'r',
  TRUNCATE_ALIAS: 't',
  INIT_ALIAS: 'i',
  WATCH_ALIAS: 'w',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_COMMAND_LIST = (typeof CE_COMMAND_LIST)[keyof typeof CE_COMMAND_LIST];
