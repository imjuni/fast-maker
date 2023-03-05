import type summaryRouteHandlerFiles from '#modules/summaryRouteHandlerFiles';
import posixJoin from '#tools/posixJoin';
import * as env from '#tools/__tests__/tools/env';
import type { AsyncReturnType } from 'type-fest';

const data: AsyncReturnType<typeof summaryRouteHandlerFiles> = {
  kind: 'summary-route-handler-file',
  summary: {
    get: [
      {
        kind: 'route',
        filePath: posixJoin(env.handlerPath, '/get/justice/[dc-league]/hello.ts'),
        method: 'get',
        routePath: '/justice/:dc-league/hello',
      },
      {
        kind: 'route',
        filePath: posixJoin(env.handlerPath, '/get/justice/[kind]-[id]/hello.ts'),
        method: 'get',
        routePath: '/justice/:kind-:id/hello',
      },
      {
        kind: 'route',
        filePath: posixJoin(env.handlerPath, '/get/justice/world/[id].ts'),
        method: 'get',
        routePath: '/justice/world/:id',
      },
      {
        kind: 'route',
        filePath: posixJoin(env.handlerPath, '/get/xman/fastify.ts'),
        method: 'get',
        routePath: '/xman/fastify',
      },
      {
        kind: 'route',
        filePath: posixJoin(env.handlerPath, '/get/xman/world.ts'),
        method: 'get',
        routePath: '/xman/world',
      },
    ],
    post: [
      {
        kind: 'route',
        filePath: posixJoin(env.handlerPath, '/post/justice/[dc-league]/world.ts'),
        method: 'post',
        routePath: '/justice/:dc-league/world',
      },
      {
        kind: 'route',
        filePath: posixJoin(env.handlerPath, '/post/justice/[dc-league]/world/index.ts'),
        method: 'post',
        routePath: '/justice/:dc-league/world',
      },
    ],
    put: [
      {
        kind: 'route',
        filePath: posixJoin(env.handlerPath, '/put/po-ke/world.ts'),
        method: 'put',
        routePath: '/po-ke/world',
      },
    ],
    delete: [
      {
        kind: 'route',
        filePath: posixJoin(env.handlerPath, '/delete/justice/world.ts'),
        method: 'delete',
        routePath: '/justice/world',
      },
    ],
    patch: [
      {
        kind: 'route',
        filePath: posixJoin(env.handlerPath, '/patch/justice/world.ts'),
        method: 'patch',
        routePath: '/justice/world',
      },
    ],
    options: [
      {
        kind: 'route',
        filePath: posixJoin(env.handlerPath, '/options/xman/hello.ts'),
        method: 'options',
        routePath: '/xman/hello',
      },
    ],
    head: [
      {
        kind: 'route',
        filePath: posixJoin(env.handlerPath, '/head/xman/world.ts'),
        method: 'head',
        routePath: '/xman/world',
      },
    ],
    all: [
      {
        kind: 'route',
        filePath: posixJoin(env.handlerPath, '/all/po-ke/hello.ts'),
        method: 'all',
        routePath: '/po-ke/hello',
      },
    ],
  },
};

export default data;
