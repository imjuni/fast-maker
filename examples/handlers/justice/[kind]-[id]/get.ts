import type { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import type { Server } from 'http';
import type { IReqPokeHelloMultiParam } from '../../interfaces/IReqPokeHelloMultiParam';
import schema from '../../interfaces/JSC_IReqPokeHello';

export const option: RouteShorthandOptions = {
  schema: {
    querystring: schema.properties?.Querystring,
    body: schema.properties?.Body,
  },
};

export const handler = async (req: FastifyRequest<IReqPokeHelloMultiParam, Server>, _reply: FastifyReply) => {
  console.debug(req.query);
  console.debug(req.body);
  console.debug(req.params);

  return 'hello';
};
