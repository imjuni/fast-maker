export const CE_SEND_TO_PARENT_COMMAND = {
  PROGRESS_START: 'progress-start',
  PROGRESS_INCREMENT: 'progress-increment',
  PROGRESS_UPDATE: 'progress-update',
  PROGRESS_STOP: 'progress-stop',

  SPINER_START: 'spiner-start',
  SPINER_END: 'spiner-end',
  SPINER_UPDATE: 'spiner-update',

  RECEIVE_REPLY: 'receive-reply',
} as const;

/* eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention */
export type CE_SEND_TO_PARENT_COMMAND = (typeof CE_SEND_TO_PARENT_COMMAND)[keyof typeof CE_SEND_TO_PARENT_COMMAND];

export default interface ISendToParent {
  command: CE_SEND_TO_PARENT_COMMAND;
}
