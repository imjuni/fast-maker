import fs from 'fs';
import { parse } from 'jsonc-parser';
import path from 'path';

export default async function getData<T = unknown>(...filePaths: string[]): Promise<T> {
  const filePath = path.join(...filePaths);
  const buf = await fs.promises.readFile(filePath);
  const parsed = parse(buf.toString()) as T;
  return parsed;
}
