import { isValidMethod } from '#/routes/validations/isValidMethod';
import type { HTTPMethods } from 'fastify';

export async function getExtraMethod(filePath: string): Promise<HTTPMethods[]> {
  try {
    const imported = (await import(filePath)) as { methods?: HTTPMethods | HTTPMethods[] };

    if ('methods' in imported && imported.methods != null) {
      const { methods } = imported;

      if (typeof methods === 'object' && Array.isArray(methods)) {
        return methods.filter((method) => isValidMethod(method));
      }

      if (typeof methods === 'string' && isValidMethod(methods)) {
        return [methods];
      }

      return [];
    }

    return [];
  } catch {
    return [];
  }
}
