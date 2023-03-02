import type { FastifyInstance } from 'fastify';

type TMethodType = Extract<
  keyof FastifyInstance,
  'get' | 'post' | 'put' | 'delete' | 'options' | 'head' | 'patch' | 'all'
>;

export const CE_ROUTE_METHOD: Record<Uppercase<TMethodType>, TMethodType> = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete',
  OPTIONS: 'options',
  HEAD: 'head',
  PATCH: 'patch',
  ALL: 'all',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_ROUTE_METHOD = (typeof CE_ROUTE_METHOD)[keyof typeof CE_ROUTE_METHOD];
