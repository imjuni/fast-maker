import { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import { Server } from 'http';
import type IReqInvalidPokeHello from '../../interface/IReqInvalidPokeHello';
import schema from '../../interface/JSC_IReqPokeHello';

export const option: RouteShorthandOptions = {
  schema: {
    querystring: schema.properties?.Querystring,
    body: schema.properties?.Body,
  },
};

const world = async (req: FastifyRequest<IReqInvalidPokeHello, Server>, _reply: FastifyReply) => {
  console.debug(req.query);
  console.debug(req.body);

  return 'world';
};

export default world;
