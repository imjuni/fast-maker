import type { CE_ROUTE_METHOD } from '#/routes/interface/CE_ROUTE_METHOD';
import { atOrThrow } from 'my-easy-fp';
import { exists, isDescendant, startSepRemove } from 'my-node-fp';
import * as path from 'path';

export default async function getHandlerFile(
  filePaths: string[],
  handlerRoot: string,
  method: CE_ROUTE_METHOD,
): Promise<string[]> {
  try {
    const handlerPaths = await Promise.all(
      filePaths.map(async (filePath) => {
        if ((await exists(filePath)) === false) {
          return undefined;
        }

        if (isDescendant(handlerRoot, filePath)) {
          const handlerFilePath = startSepRemove(filePath.replace(handlerRoot, ''), path.posix.sep);
          const methodOfFilePath = atOrThrow(handlerFilePath.split(path.posix.sep), 0).toLowerCase();

          if (methodOfFilePath.toLowerCase() !== method) {
            return undefined;
          }

          return filePath;
        }

        return undefined;
      }),
    );

    const nonNullables = handlerPaths.filter((handlerPath): handlerPath is string => handlerPath != null);
    return nonNullables;
  } catch (err) {
    return [];
  }
}
