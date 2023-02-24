import fastSafeStringify from 'fast-safe-stringify';
import fs from 'fs';
import path from 'path';

export default async function saveData<T = unknown>(data: T, ...filePaths: string[]): Promise<void> {
  const filePath = path.join(...filePaths);
  await fs.promises.writeFile(filePath, fastSafeStringify(data, undefined, 2));
}
