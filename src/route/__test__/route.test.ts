import getHandlerFile from '@route/getHandlerFile';
import getRouteFiles from '@route/getRouteFiles';
import getRoutePath from '@route/getRoutePath';
import * as env from '@testenv/env';
import 'jest';
import { replaceSepToPosix } from 'my-node-fp';
import path from 'path';

describe('route-test', () => {
  test('getHandlerFile', async () => {
    const files = await getHandlerFile(path.join(env.handlerPath, 'get'));

    const expectation = [
      replaceSepToPosix(path.join(env.handlerPath, 'get/justice/[dc-league]/hello.ts')),
      replaceSepToPosix(path.join(env.handlerPath, 'get/justice/[dc-league]/world.ts')),
      replaceSepToPosix(path.join(env.handlerPath, 'get/justice/world.ts')),
      replaceSepToPosix(path.join(env.handlerPath, 'get/po-ke/hello.ts')),
      replaceSepToPosix(path.join(env.handlerPath, 'get/po-ke/world.ts')),
      replaceSepToPosix(path.join(env.handlerPath, 'get/xman/fastify.ts')),
      replaceSepToPosix(path.join(env.handlerPath, 'get/xman/hello.ts')),
      replaceSepToPosix(path.join(env.handlerPath, 'get/xman/world.ts')),
    ];

    expect(files).toEqual(expectation);
  });

  test('getRoutePath', () => {
    const inputs = [
      replaceSepToPosix(path.join(env.handlerPath, 'post\\avengers\\heros\\[id]\\hero.ts')),
      replaceSepToPosix(path.join(env.handlerPath, 'post\\avengers\\heros\\index.ts')),
      replaceSepToPosix(path.join(env.handlerPath, 'post\\avengers\\heros.ts')),
      replaceSepToPosix(path.join(env.handlerPath, 'get\\justice\\[dc-league]\\hello.ts')),
      replaceSepToPosix(path.join(env.handlerPath, 'get\\po-ke\\hello.ts')),
    ];

    const routePaths = inputs.map((filename) => getRoutePath(filename));

    const expectation = [
      {
        filename: replaceSepToPosix(path.join(env.handlerPath, 'post/avengers/heros/[id]/hero.ts')),
        method: 'post',
        routePath: '/avengers/heros/:id/hero',
      },
      {
        filename: replaceSepToPosix(path.join(env.handlerPath, 'post/avengers/heros/index.ts')),
        method: 'post',
        routePath: '/avengers/heros',
      },
      {
        filename: replaceSepToPosix(path.join(env.handlerPath, 'post/avengers/heros.ts')),
        method: 'post',
        routePath: '/avengers/heros',
      },
      {
        filename: replaceSepToPosix(path.join(env.handlerPath, 'get/justice/[dc-league]/hello.ts')),
        method: 'get',
        routePath: '/justice/:dc-league/hello',
      },
      {
        filename: replaceSepToPosix(path.join(env.handlerPath, 'get/po-ke/hello.ts')),
        method: 'get',
        routePath: '/po-ke/hello',
      },
    ];

    expect(routePaths).toEqual(expectation);
  });

  test('getRouteFiles', async () => {
    const routeFiles = await getRouteFiles(env.handlerPath);

    const expectation = [
      {
        filename: replaceSepToPosix(path.join(env.handlerPath, 'delete/hello.ts')),
        method: 'delete',
        routePath: '/hello',
      },
      {
        filename: replaceSepToPosix(path.join(env.handlerPath, 'delete/world.ts')),
        method: 'delete',
        routePath: '/world',
      },
      {
        filename: replaceSepToPosix(path.join(env.handlerPath, 'get/justice/[dc-league]/hello.ts')),
        method: 'get',
        routePath: '/justice/:dc-league/hello',
      },
      {
        filename: replaceSepToPosix(path.join(env.handlerPath, 'get/justice/[dc-league]/world.ts')),
        method: 'get',
        routePath: '/justice/:dc-league/world',
      },
      {
        filename: replaceSepToPosix(path.join(env.handlerPath, 'get/justice/world.ts')),
        method: 'get',
        routePath: '/justice/world',
      },
      {
        filename: replaceSepToPosix(path.join(env.handlerPath, 'get/po-ke/hello.ts')),
        method: 'get',
        routePath: '/po-ke/hello',
      },
      {
        filename: replaceSepToPosix(path.join(env.handlerPath, 'get/po-ke/world.ts')),
        method: 'get',
        routePath: '/po-ke/world',
      },
      {
        filename: replaceSepToPosix(path.join(env.handlerPath, 'get/xman/fastify.ts')),
        method: 'get',
        routePath: '/xman/fastify',
      },
      {
        filename: replaceSepToPosix(path.join(env.handlerPath, 'get/xman/hello.ts')),
        method: 'get',
        routePath: '/xman/hello',
      },
      {
        filename: replaceSepToPosix(path.join(env.handlerPath, 'get/xman/world.ts')),
        method: 'get',
        routePath: '/xman/world',
      },
      {
        filename: replaceSepToPosix(path.join(env.handlerPath, 'post/avengers/heros.ts')),
        method: 'post',
        routePath: '/avengers/heros',
      },
      {
        filename: replaceSepToPosix(path.join(env.handlerPath, 'post/avengers/heros/[id]/hero.ts')),
        method: 'post',
        routePath: '/avengers/heros/:id/hero',
      },
      {
        filename: replaceSepToPosix(path.join(env.handlerPath, 'post/avengers/heros/index.ts')),
        method: 'post',
        routePath: '/avengers/heros',
      },
      {
        filename: replaceSepToPosix(path.join(env.handlerPath, 'post/dc/world.ts')),
        method: 'post',
        routePath: '/dc/world',
      },
      {
        filename: replaceSepToPosix(path.join(env.handlerPath, 'post/hello.ts')),
        method: 'post',
        routePath: '/hello',
      },
      {
        filename: replaceSepToPosix(path.join(env.handlerPath, 'put/hello.ts')),
        method: 'put',
        routePath: '/hello',
      },
      {
        filename: replaceSepToPosix(path.join(env.handlerPath, 'put/world.ts')),
        method: 'put',
        routePath: '/world',
      },
    ];

    expect(routeFiles).toStrictEqual(expectation);
  });
});
