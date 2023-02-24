import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { Server } from 'http';
import type IReqPokeHello from '../interface/IReqPokeHello';
import schema from '../interface/JSC_IReqPokeHello';

export const option: RouteShorthandOptions = {
  schema: {
    querystring: schema.properties?.Querystring,
    body: schema.properties?.Body,
  },
};

export default function iamerror(req: FastifyRequest<IReqPokeHello, Server>) {
  console.debug(req.query);
  console.debug(req.body);

  return 'hello';
}
