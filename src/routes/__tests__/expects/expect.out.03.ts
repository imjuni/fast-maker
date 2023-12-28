import * as env from '#/tools/__tests__/tools/env';
import posixJoin from '#/tools/posixJoin';

export default {
  kind: 'summary-route-handler-file',
  summary: {
    get: [
      {
        kind: 'route',
        filePath: posixJoin(env.handlerPath, 'get/justice/[dc-league]/hello.ts'),
        method: 'get',
        routePath: '/justice/:dc-league/hello',
      },
      {
        kind: 'route',
        filePath: posixJoin(env.handlerPath, 'get/justice/[dc-league]/world.ts'),
        method: 'get',
        routePath: '/justice/:dc-league/world',
      },
      {
        kind: 'route',
        filePath: posixJoin(env.handlerPath, 'get/justice/[kind]-[id]/hello.ts'),
        method: 'get',
        routePath: '/justice/:kind-:id/hello',
      },
      {
        kind: 'route',
        filePath: posixJoin(env.handlerPath, 'get/justice/world.ts'),
        method: 'get',
        routePath: '/justice/world',
      },
      {
        kind: 'route',
        filePath: posixJoin(env.handlerPath, 'get/justice/world/[id].ts'),
        method: 'get',
        routePath: '/justice/world/:id',
      },
      {
        kind: 'route',
        filePath: posixJoin(env.handlerPath, 'get/po-ke/hello.ts'),
        method: 'get',
        routePath: '/po-ke/hello',
      },
      {
        kind: 'route',
        filePath: posixJoin(env.handlerPath, 'get/po-ke/world.ts'),
        method: 'get',
        routePath: '/po-ke/world',
      },
      {
        kind: 'route',
        filePath: posixJoin(env.handlerPath, 'get/xman/fastify.ts'),
        method: 'get',
        routePath: '/xman/fastify',
      },
      {
        kind: 'route',
        filePath: posixJoin(env.handlerPath, 'get/xman/hello.ts'),
        method: 'get',
        routePath: '/xman/hello',
      },
      {
        kind: 'route',
        filePath: posixJoin(env.handlerPath, 'get/xman/world.ts'),
        method: 'get',
        routePath: '/xman/world',
      },
    ],
    post: [],
    put: [],
    delete: [],
    patch: [],
    options: [],
    head: [],
    all: [],
  },
};
