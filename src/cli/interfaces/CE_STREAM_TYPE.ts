export const CE_STREAM_TYPE: {
  STDOUT: Extract<Extract<keyof typeof process, 'stdout' | 'stderr'>, 'stdout'>;
  STDERR: Extract<Extract<keyof typeof process, 'stdout' | 'stderr'>, 'stderr'>;
} = {
  STDOUT: 'stdout',
  STDERR: 'stderr',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_STREAM_TYPE = (typeof CE_STREAM_TYPE)[keyof typeof CE_STREAM_TYPE];
