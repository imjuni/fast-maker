import { RouteShorthandOptions } from 'fastify';
import TAbnormalPresident from '../../interface/TPresident';
import schema from '../get/interface/JSC_IReqPokeHello';

export const option: RouteShorthandOptions = {
  schema: {
    querystring: schema.properties?.Querystring,
    body: schema.properties?.Body,
  },
};

export default async (req: TAbnormalPresident) => {
  console.debug(req.query);
  console.debug(req.body);

  return 'world';
};
