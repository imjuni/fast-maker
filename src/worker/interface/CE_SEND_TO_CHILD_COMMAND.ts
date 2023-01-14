export const CE_SEND_TO_CHILD_COMMAND = {
  DO_WORK: 'do-work',
  TERMINATE: 'terminate',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_SEND_TO_CHILD_COMMAND = (typeof CE_SEND_TO_CHILD_COMMAND)[keyof typeof CE_SEND_TO_CHILD_COMMAND];
