import { existsSync, isDirectorySync } from 'my-node-fp';
import path from 'path';

export function getOutputFilePath(...filePaths: string[]) {
  const dirPath = path.resolve(path.join(...filePaths));

  if (existsSync(dirPath) && isDirectorySync(dirPath)) {
    return path.join(dirPath, 'route.ts');
  }

  if (dirPath.endsWith('.ts')) {
    return dirPath;
  }

  return path.join(dirPath, 'route.ts');
}
