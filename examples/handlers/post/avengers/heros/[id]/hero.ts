import { FastifyRequest } from 'fastify';
import { IAbility } from '../../../../../interface/IAbility';

export default async function hero(req: FastifyRequest<{ Body: IAbility }>) {
  return req.body;
}
