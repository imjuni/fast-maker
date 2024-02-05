import type { HTTPMethods } from 'fastify';

export const methods: HTTPMethods = 'SEARCH';

export async function handler() {
  return 'hello';
}
