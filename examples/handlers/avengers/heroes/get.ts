/**
 * Example of the extra methods
 *
 * To apply more than one method to a single handler, use the `methods` variable.
 */
import type { HTTPMethods } from 'fastify';

// methods variable
// methods variable replace to `fastify.route({ methods: ['get', 'search', 'options'] })`
export const methods: HTTPMethods[] = ['SEARCH', 'OPTIONS'];

export async function handler() {
  return 'hello';
}
