/**
 * Example of the multiple variable in single route path element
 *
 * justice/[kind]-[id] replace to `justice/:kind-:id`
 */
import type { FastifyInstance, FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import type { Server } from 'http';
import type { IReqPokeHelloMultiParam } from '../../interfaces/IReqPokeHelloMultiParam';
import schema from '../../interfaces/JSC_IReqPokeHello';

export const option: (fastify: FastifyInstance) => RouteShorthandOptions = () => ({
  schema: {
    querystring: schema.properties?.Querystring,
    body: schema.properties?.Body,
  },
});

export const handler = async (req: FastifyRequest<IReqPokeHelloMultiParam, Server>, _reply: FastifyReply) => {
  console.debug(req.query);
  console.debug(req.body);
  console.debug(req.params);

  return 'hello';
};
