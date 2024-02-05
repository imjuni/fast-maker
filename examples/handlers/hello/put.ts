import { RouteShorthandOptions } from 'fastify';
import schema from '../interfaces/JSC_IReqPokeHello';

export const option: RouteShorthandOptions = {
  schema: {
    querystring: schema.properties?.Querystring,
    body: schema.properties?.Body,
  },
};

export async function handler() {
  return 'hello';
}
