import { getCwd } from '#/modules/files/getCwd';
import { exists } from 'my-node-fp';
import path from 'node:path';

export async function getResolvedPath(originPath: string, nullableCwd?: string): Promise<string> {
  const cwd = nullableCwd ?? getCwd(process.env);
  const resolvedPath = path.resolve(originPath);

  if (path.isAbsolute(originPath)) {
    return resolvedPath;
  }

  if (await exists(resolvedPath)) {
    return resolvedPath;
  }

  return path.join(cwd, originPath);
}
