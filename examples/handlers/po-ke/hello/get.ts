import type { FastifyInstance, FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import type { Server } from 'http';
import type { IReqPokeHello } from '../../interfaces/IReqPokeHello';
import schema from '../../interfaces/JSC_IReqPokeHello';

export const option: (fastify: FastifyInstance) => RouteShorthandOptions = () => ({
  schema: {
    querystring: schema.properties?.Querystring,
    body: schema.properties?.Body,
  },
});

const handler = async (req: FastifyRequest<IReqPokeHello, Server>, _reply: FastifyReply) => {
  console.debug(req.query);
  console.debug(req.body);

  return 'hello';
};
