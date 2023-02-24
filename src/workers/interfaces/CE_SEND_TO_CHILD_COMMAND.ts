export const CE_SEND_TO_CHILD_COMMAND = {
  DO_INIT: 'do-init',

  DO_INIT_PROJECT: 'do-init-project',
  DO_STAGE01: 'do-stage01',
  DO_STAGE02: 'do-stage02',
  DO_STAGE03: 'do-stage03',

  TERMINATE: 'terminate',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_SEND_TO_CHILD_COMMAND = (typeof CE_SEND_TO_CHILD_COMMAND)[keyof typeof CE_SEND_TO_CHILD_COMMAND];
