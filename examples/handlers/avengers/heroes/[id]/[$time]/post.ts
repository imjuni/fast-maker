import type { FastifyRequest } from 'fastify';
import type { IAbility } from '../../../../../interface/IAbility';

export const map: Map<string, string> = new Map<string, string>([['time', ':hour(^\\d{2})h:minute(^\\d{2})m']]);

export async function handler(req: FastifyRequest<{ Body: IAbility }>) {
  return req.body;
}
