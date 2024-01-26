import type { FastifyRequest } from 'fastify';
import type { IAbility } from '../../../../interface/IAbility';

export async function handler(req: FastifyRequest<{ Body: IAbility }>) {
  return req.body;
}
