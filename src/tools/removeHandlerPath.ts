import { replaceSepToPosix, startSepAppend } from 'my-node-fp';
import path from 'node:path';

export function removeHandlerPath(routePath: string, handlerPath: string): string {
  const dirName = path.dirname(routePath);
  const fileName = path.basename(routePath);
  return startSepAppend(replaceSepToPosix(path.posix.join(dirName.replace(handlerPath, ''), fileName)));
}
