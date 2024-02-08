/**
 * Example of the function option
 *
 * If you need access to the fastify instance to use various hooks, including the preHandler,
 * you can use the function option to get the fastify instance passed to you.
 *
 * @see https://github.com/fastify/fastify-bearer-auth?tab=readme-ov-file#integration-with-fastifyauth
 */
import type { FastifyInstance, FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import type { Server } from 'http';
import type { IReqPokeHello } from '../../interfaces/IReqPokeHello';
import schema from '../../interfaces/JSC_IReqPokeHello';

export const option: (fastify: FastifyInstance) => RouteShorthandOptions = () => ({
  schema: {
    querystring: schema.properties?.Querystring,
    body: schema.properties?.Body,
  },
  // preHandler hook using fastify instance
  preHandler: fastify.auth([fastify.allowAnonymous, fastify.verifyBearerAuth]),
});

export const handler = async (
  req: FastifyRequest<
    {
      Querystring: IReqPokeHello['querystring'];
      Body: IReqPokeHello['Body'];
      Headers: {
        'access-token': string;
        'refresh-token': string;
        'expire-time': {
          token: string;
          expire: number;
          site: {
            host: string;
            port: number;
          };
        };
      };
    },
    Server
  >,
  _reply: FastifyReply,
) => {
  console.debug(req.query);
  console.debug(req.body);

  return 'world';
};
