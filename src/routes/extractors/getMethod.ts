import { isValidMethod } from '#/routes/validations/isValidMethod';
import type { HTTPMethods } from 'fastify';
import { basenames } from 'my-node-fp';

export function getMethod(filePath: string): HTTPMethods {
  const fileName = basenames(filePath, ['.ts', '.mts', '.cts']);

  if (isValidMethod(fileName)) {
    return fileName;
  }

  throw new Error(`invalid method: (${fileName}) ${filePath}`);
}
