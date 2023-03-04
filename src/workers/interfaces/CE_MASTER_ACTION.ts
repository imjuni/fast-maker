export const CE_MASTER_ACTION = {
  TASK_COMPLETE: 'task-complete',
  PROGRESS_UPDATE: 'progress-update',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_MASTER_ACTION = (typeof CE_MASTER_ACTION)[keyof typeof CE_MASTER_ACTION];
