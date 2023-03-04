import fastSafeStringify from 'fast-safe-stringify';
import fs from 'fs';
import { exists } from 'my-node-fp';
import path from 'path';

export default async function writeOutputFile<T = string>(filePath: string, data: T) {
  if (await exists(filePath)) {
    await fs.promises.writeFile(filePath, fastSafeStringify(data));
  }

  const dirPath = path.dirname(filePath);
  await fs.promises.mkdir(dirPath, { recursive: true });
  await fs.promises.writeFile(filePath, fastSafeStringify(data));
}
