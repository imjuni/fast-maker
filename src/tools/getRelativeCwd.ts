import { startSepRemove } from 'my-node-fp';

export function getRelativeCwd(cwd: string, filePath: string): string {
  return startSepRemove(filePath.replace(cwd, ''));
}
