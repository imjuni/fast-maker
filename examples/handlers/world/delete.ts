import type { FastifyInstance, RouteShorthandOptions } from 'fastify';
import type TAbnormalPresident from '../../interface/TPresident';
import schema from '../interfaces/JSC_IReqPokeHello';

export const option: (fastify: FastifyInstance) => RouteShorthandOptions = () => ({
  schema: {
    querystring: schema.properties?.Querystring,
    body: schema.properties?.Body,
  },
});

export const handler = async (req: TAbnormalPresident) => {
  console.debug(req.query);
  console.debug(req.body);

  return 'world';
};
