import type { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import type { IReqPokeHello } from '../../interfaces/IReqPokeHello';
import schema from '../../interfaces/JSC_IReqPokeHello';

export const option: RouteShorthandOptions = {
  schema: {
    querystring: schema.properties?.Querystring,
    body: schema.properties?.Body,
  },
};

// eslint-disable-next-line func-names
export function handler(req: FastifyRequest<IReqPokeHello>, reply: FastifyReply) {
  console.debug(req.query);
  console.debug(req.body);

  return 'hello';
}
