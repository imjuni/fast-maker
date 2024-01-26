// import { RouteShorthandOptions } from 'fastify';
import { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import { Server } from 'http';
import type { IReqPokeHello } from '../../interfaces/IReqPokeHello';
import schema from '../../interfaces/JSC_IReqPokeHello';

// interface IQuerystring {
//   name: string;
// }

export const option: RouteShorthandOptions = {
  schema: {
    querystring: schema.properties?.Querystring,
    body: schema.properties?.Body,
  },
};

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
