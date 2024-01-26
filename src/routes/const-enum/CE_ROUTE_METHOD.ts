import type { HTTPMethods } from 'fastify';

export const CE_ROUTE_METHOD: Record<Uppercase<HTTPMethods>, HTTPMethods> = {
  DELETE: 'delete',
  GET: 'get',
  HEAD: 'head',
  PATCH: 'patch',
  POST: 'post',
  PUT: 'put',
  OPTIONS: 'options',
  PROPFIND: 'propfind',
  PROPPATCH: 'proppatch',
  MKCOL: 'mkcol',
  COPY: 'copy',
  MOVE: 'move',
  LOCK: 'lock',
  UNLOCK: 'unlock',
  TRACE: 'trace',
  SEARCH: 'search',
} as const;

export type CE_ROUTE_METHOD = (typeof CE_ROUTE_METHOD)[keyof typeof CE_ROUTE_METHOD];
