import doMethodAggregator from '#modules/doMethodAggregator';
import getSummaryByMethod from '#routes/getSummaryByMethod';
import { CE_ROUTE_METHOD } from '#routes/interface/CE_ROUTE_METHOD';
import posixJoin from '#tools/posixJoin';
import * as env from '#tools/__tests__/tools/env';
import 'jest';

describe('getSummaryByMethod', () => {
  test('pass', async () => {
    const inputs = [
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

    const r = getSummaryByMethod(inputs, { handler: env.handlerPath, cwd: env.handlerPath });
    console.log(r);
  });
});

describe('doMethodAggregator', () => {
  test('pass', async () => {
    const inputs = [
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

    const expectation = {
      get: [
        {
          filePath: posixJoin(env.handlerPath, '/get/justice/[dc-league]/hello.ts'),
          method: 'get',
          routePath: '/justice/:dc-league/hello',
        },
        {
          filePath: posixJoin(env.handlerPath, '/get/justice/[kind]-[id]/hello.ts'),
          method: 'get',
          routePath: '/justice/:kind-:id/hello',
        },
        {
          filePath: posixJoin(env.handlerPath, '/get/justice/world/[id].ts'),
          method: 'get',
          routePath: '/justice/world/:id',
        },
        {
          filePath: posixJoin(env.handlerPath, '/get/xman/fastify.ts'),
          method: 'get',
          routePath: '/xman/fastify',
        },
        {
          filePath: posixJoin(env.handlerPath, '/get/xman/world.ts'),
          method: 'get',
          routePath: '/xman/world',
        },
      ],
      post: [
        {
          filePath: posixJoin(env.handlerPath, '/post/justice/[dc-league]/world.ts'),
          method: 'post',
          routePath: '/justice/:dc-league/world',
        },
      ],
      put: [
        {
          filePath: posixJoin(env.handlerPath, '/put/po-ke/world.ts'),
          method: 'put',
          routePath: '/po-ke/world',
        },
      ],
      delete: [
        {
          filePath: posixJoin(env.handlerPath, '/delete/justice/world.ts'),
          method: 'delete',
          routePath: '/justice/world',
        },
      ],
      patch: [
        {
          filePath: posixJoin(env.handlerPath, '/patch/justice/world.ts'),
          method: 'patch',
          routePath: '/justice/world',
        },
      ],
      options: [
        {
          filePath: posixJoin(env.handlerPath, '/options/xman/hello.ts'),
          method: 'options',
          routePath: '/xman/hello',
        },
      ],
      head: [
        {
          filePath: posixJoin(env.handlerPath, '/head/xman/world.ts'),
          method: 'head',
          routePath: '/xman/world',
        },
      ],
      all: [
        {
          filePath: posixJoin(env.handlerPath, '/all/po-ke/hello.ts'),
          method: 'all',
          routePath: '/po-ke/hello',
        },
      ],
    };

    const r = await doMethodAggregator(inputs, { handler: env.handlerPath, cwd: env.handlerPath });

    expect(r).toMatchObject(expectation);
  });
});
