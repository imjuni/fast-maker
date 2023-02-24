import { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import { Server } from 'http';
import IReqPokeHelloMultiParam from '../../interface/IReqPokeHelloMultiParam';
import schema from '../../interface/JSC_IReqPokeHello';

export const option: RouteShorthandOptions = {
  schema: {
    querystring: schema.properties?.Querystring,
    body: schema.properties?.Body,
  },
};

const hello = async (req: FastifyRequest<IReqPokeHelloMultiParam, Server>, _reply: FastifyReply) => {
  console.debug(req.query);
  console.debug(req.body);
  console.debug(req.params);

  return 'hello';
};

export default hello;
