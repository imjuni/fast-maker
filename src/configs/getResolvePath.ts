import getCwd from '#tools/getCwd';
import { existsSync } from 'my-node-fp';
import path from 'path';

export default function getResolvePath(filePath: string): boolean {
  if (existsSync(path.resolve(filePath))) {
    return true;
  }

  if (existsSync(path.resolve(path.join(getCwd(process.env), filePath)))) {
    return true;
  }

  return false;
}
