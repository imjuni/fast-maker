/** import statement  */
export const CE_EXT_KIND = {
  NONE: 'none',
  KEEP: 'keep',
  JS: '.js',
  CJS: '.cjs',
  MJS: '.mjs',
  TS: '.ts',
  CTS: '.cts',
  MTS: '.mts',
} as const;

export type CE_EXT_KIND = (typeof CE_EXT_KIND)[keyof typeof CE_EXT_KIND];
