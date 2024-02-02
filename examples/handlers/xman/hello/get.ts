import type { FastifyInstance, FastifyRequest, RouteShorthandOptions } from 'fastify';
import type { Server } from 'http';
import type { IReqPokeHello } from '../../interfaces/IReqPokeHello';
import schema from '../../interfaces/JSC_IReqPokeHello';

export const option: (fastify: FastifyInstance) => RouteShorthandOptions = () => ({
  schema: {
    querystring: schema.properties?.Querystring,
    body: schema.properties?.Body,
  },
});

export function handler(req: FastifyRequest<IReqPokeHello, Server>) {
  console.debug(req.query);
  console.debug(req.body);

  return 'hello';
}
