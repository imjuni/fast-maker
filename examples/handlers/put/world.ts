import { FastifyRequest, FastifyReply, RouteShorthandOptions } from 'fastify';
import ICompany from '../../interface/ICompany';

export const option: RouteShorthandOptions = {
  schema: {},
};

const world = async (req: FastifyRequest<ICompany>, _reply: FastifyReply) => {
  console.debug(req.query);
  console.debug(req.body);

  return 'world';
};

export default world;
