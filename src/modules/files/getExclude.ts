export function getExclude(tsconfig?: unknown) {
  if (tsconfig == null) {
    return [];
  }

  if (typeof tsconfig === 'object' && tsconfig != null && 'exclude' in tsconfig && tsconfig.exclude != null) {
    const { exclude } = tsconfig;

    if (Array.isArray(exclude) && exclude.length > 0 && exclude.every((element) => typeof element === 'string')) {
      return exclude as string[];
    }

    return [];
  }

  return [];
}
