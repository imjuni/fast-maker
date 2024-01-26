export const CE_INLINE_COMMENT_KEYWORD = {
  FILE_EXCLUDE_KEYWORD: '@maeum-file-exclude',
  FAST_MAKER_WORKSPACE: 'fast-maker',
} as const;

export type CE_INLINE_COMMENT_KEYWORD = (typeof CE_INLINE_COMMENT_KEYWORD)[keyof typeof CE_INLINE_COMMENT_KEYWORD];
