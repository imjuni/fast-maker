import type { IBaseOption } from '#/configs/interfaces/IBaseOption';
import { getFileScope } from '#/modules/files/getFileScope';
import type * as tsm from 'ts-morph';

export function getExcludePatterns(
  options: Pick<IBaseOption, 'exclude'>,
  tsconfig: Pick<tsm.ts.ParsedCommandLine, 'fileNames' | 'raw'>,
): string[] {
  if (options.exclude != null && options.exclude.length > 0) {
    return options.exclude;
  }

  const { exclude } = getFileScope(tsconfig.raw);
  return exclude;
}
