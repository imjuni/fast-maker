import type { FastifyInstance, FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import type { Server } from 'http';
import type IReqInvalidPokeHello from '../../../interfaces/IReqInvalidPokeHello';
import schema from '../../../interfaces/JSC_IReqPokeHello';

export const option: (fastify: FastifyInstance) => RouteShorthandOptions = () => ({
  schema: {
    querystring: schema.properties?.Querystring,
    body: schema.properties?.Body,
  },
});

export async function handler(req: FastifyRequest<IReqInvalidPokeHello, Server>, _reply: FastifyReply) {
  console.debug(req.query);
  console.debug(req.body);

  return 'world';
}
