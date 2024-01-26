import type { IBaseOption } from '#/configs/interfaces/IBaseOption';
import { getFileScope } from '#/modules/files/getFileScope';
import { isDescendant } from 'my-node-fp';
import type * as tsm from 'ts-morph';

export function getIncludePatterns(
  options: Pick<IBaseOption, 'include'>,
  tsconfig: Pick<tsm.ts.ParsedCommandLine, 'fileNames' | 'raw'>,
  projectDirPath: string,
): string[] {
  if (options.include != null && options.include.length > 0) {
    return options.include;
  }

  const { include } = getFileScope(tsconfig.raw);

  if (include.length > 0) {
    return include;
  }

  const filePaths = tsconfig.fileNames.filter((filePath) => isDescendant(projectDirPath, filePath));

  return filePaths;
}
