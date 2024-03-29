/**
 * Example of the nullable variable
 *
 * A nullable variable uses double square brackets.
 *
 * [[id]] replace to `:id?`
 */
import type { HTTPMethods } from 'fastify';

export const methods: HTTPMethods = 'SEARCH';

export async function handler() {
  return 'hello';
}
