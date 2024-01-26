export function getInclude(tsconfig?: unknown) {
  if (tsconfig == null) {
    return [];
  }

  if (typeof tsconfig === 'object' && tsconfig != null && 'include' in tsconfig && tsconfig.include != null) {
    const { include } = tsconfig;

    if (Array.isArray(include) && include.length > 0 && include.every((element) => typeof element === 'string')) {
      return include as string[];
    }

    return [];
  }

  return [];
}
