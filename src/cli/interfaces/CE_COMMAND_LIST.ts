export const CE_COMMAND_LIST = {
  ROUTE: 'route',
  WATCH: 'watch',
  INIT: 'init',
  ROUTE_ALIAS: 'r',
  WATCH_ALIAS: 'w',
  INIT_ALIAS: 'i',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_COMMAND_LIST = (typeof CE_COMMAND_LIST)[keyof typeof CE_COMMAND_LIST];
