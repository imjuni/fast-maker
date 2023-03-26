import { CE_ROUTE_METHOD } from '#routes/interface/CE_ROUTE_METHOD';
import * as env from '#tools/__tests__/tools/env';
import posixJoin from '#tools/posixJoin';

export default [
  posixJoin(env.handlerPath, CE_ROUTE_METHOD.GET, 'justice', '[dc-league]', 'hello.ts'),
  posixJoin(env.handlerPath, CE_ROUTE_METHOD.POST, 'justice', '[dc-league]', 'world.ts'),
  posixJoin(env.handlerPath, CE_ROUTE_METHOD.GET, 'justice', '[kind]-[id]', 'hello.ts'),
  posixJoin(env.handlerPath, CE_ROUTE_METHOD.DELETE, 'justice', 'world.ts'),
  posixJoin(env.handlerPath, CE_ROUTE_METHOD.PATCH, 'justice', 'world.ts'),
  posixJoin(env.handlerPath, CE_ROUTE_METHOD.GET, 'justice', 'world', '[id].ts'),
  posixJoin(env.handlerPath, CE_ROUTE_METHOD.ALL, 'po-ke', 'hello.ts'),
  posixJoin(env.handlerPath, CE_ROUTE_METHOD.PUT, 'po-ke', 'world.ts'),
  posixJoin(env.handlerPath, CE_ROUTE_METHOD.GET, 'xman', 'fastify.ts'),
  posixJoin(env.handlerPath, CE_ROUTE_METHOD.OPTIONS, 'xman', 'hello.ts'),
  posixJoin(env.handlerPath, CE_ROUTE_METHOD.GET, 'xman', 'world.ts'),
  posixJoin(env.handlerPath, CE_ROUTE_METHOD.HEAD, 'xman', 'world.ts'),
];
