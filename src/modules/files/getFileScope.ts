import { getExclude } from '#/modules/files/getExclude';
import { getInclude } from '#/modules/files/getInclude';

export function getFileScope(tsconfig: unknown) {
  return {
    include: getInclude(tsconfig),
    exclude: getExclude(tsconfig),
  };
}
