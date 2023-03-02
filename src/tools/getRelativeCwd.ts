import { startSepRemove } from 'my-node-fp';

export default function getRelativeCwd(cwd: string, filePath: string): string {
  return startSepRemove(filePath.replace(cwd, ''));
}
