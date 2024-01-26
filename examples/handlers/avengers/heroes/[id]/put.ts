import type { HTTPMethods } from 'fastify';

export const methods: HTTPMethods[] = ['PATCH'];

export async function hello() {
  return 'hello';
}
