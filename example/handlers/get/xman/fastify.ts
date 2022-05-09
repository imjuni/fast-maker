import { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import type IReqPokeHello from '../interface/IReqPokeHello';
import schema from '../interface/JSC_IReqPokeHello';

export const option: RouteShorthandOptions = {
  schema: {
    querystring: schema.properties?.Querystring,
    body: schema.properties?.Body,
  },
};

// eslint-disable-next-line func-names
export default function (req: FastifyRequest<IReqPokeHello>, reply: FastifyReply) {
  console.debug(req.query);
  console.debug(req.body);

  reply.send('hello');
}
