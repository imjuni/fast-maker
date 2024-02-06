export const CE_COMMAND_LIST = {
  ROUTE: 'route',
  INIT: 'init',
  ROUTE_ALIAS: 'r',
  INIT_ALIAS: 'i',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_COMMAND_LIST = (typeof CE_COMMAND_LIST)[keyof typeof CE_COMMAND_LIST];
