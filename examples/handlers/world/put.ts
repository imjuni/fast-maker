import type { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
import type ICompany from '../../interface/ICompany';

export const option: RouteShorthandOptions = {
  schema: {},
};

export const handler = async (req: FastifyRequest<ICompany>, _reply: FastifyReply) => {
  console.debug(req.query);
  console.debug(req.body);

  return 'world';
};
