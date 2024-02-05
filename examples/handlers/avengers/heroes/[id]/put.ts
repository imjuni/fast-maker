import type { HTTPMethods } from 'fastify';

export const methods: HTTPMethods[] = ['PATCH'];

export async function handler() {
  return 'hello';
}
