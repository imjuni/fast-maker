import path from 'node:path';

export default async function loadSourceData<T = unknown>(module: string, ...filePaths: string[]): Promise<T> {
  const filePath = path.join(...filePaths);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const imported = await import(filePath);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return imported[module] as T;
}
