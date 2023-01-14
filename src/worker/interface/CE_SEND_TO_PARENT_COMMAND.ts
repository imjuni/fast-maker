export const CE_SEND_TO_PARENT_COMMAND = {
  PROGRESS_START: 'progress-start',
  PROGRESS_INCREMENT: 'progress-increment',
  PROGRESS_UPDATE: 'progress-update',
  PROGRESS_STOP: 'progress-stop',

  SPINER_START: 'spiner-start',
  SPINER_END: 'spiner-end',
  SPINER_UPDATE: 'spiner-update',

  DONE_DO_INIT: 'done-do-init',
  DONE_DO_INIT_PROJECT: 'done-do-init-project',
  FAIL_DO_INIT_PROJECT: 'fail-do-init-project',
  DONE_DO_STAGE01: 'done-do-stage01',
  FAIL_DO_STAGE01: 'fail-do-stage01',
  DONE_DO_STAGE02: 'done-do-stage02',
  FAIL_DO_STAGE02: 'fail-do-stage02',
  DONE_DO_STAGE03: 'done-do-stage03',
  FAIL_DO_STAGE03: 'fail-do-stage03',

  RECEIVE_REPLY: 'receive-reply',
} as const;

/* eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention */
export type CE_SEND_TO_PARENT_COMMAND = (typeof CE_SEND_TO_PARENT_COMMAND)[keyof typeof CE_SEND_TO_PARENT_COMMAND];

export default interface ISendToParent {
  command: CE_SEND_TO_PARENT_COMMAND;
}
