import { existsSync, getDirnameSync, isDirectorySync } from 'my-node-fp';
import path from 'path';

export function getOutputMapFilePath(...filePaths: string[]) {
  const dirPath = path.resolve(path.join(...filePaths));

  if (existsSync(dirPath) && isDirectorySync(dirPath)) {
    return path.join(dirPath, 'route-map.ts');
  }

  if (dirPath.endsWith('.ts')) {
    const namePart = path.basename(dirPath, '.ts');
    const dirPart = getDirnameSync(dirPath);
    return path.join(dirPart, `${namePart}-map.ts`);
  }

  return path.join(dirPath, 'route-map.ts');
}
