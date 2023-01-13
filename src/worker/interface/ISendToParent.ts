export const CE_SEND_TO_PARENT_COMMAND = {
  PROGRESS_INCREMENT: 'progress-increment',
} as const;

/* eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention */
export type CE_SEND_TO_PARENT_COMMAND = (typeof CE_SEND_TO_PARENT_COMMAND)[keyof typeof CE_SEND_TO_PARENT_COMMAND];

export default interface ISendToParent {
  command: CE_SEND_TO_PARENT_COMMAND;
}
