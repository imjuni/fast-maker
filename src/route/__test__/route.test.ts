import proceedStage01 from '#module/proceedStage01';
import getHandlerFile from '#route/getHandlerFile';
import getRoutePath from '#route/getRoutePath';
import methods from '#route/interface/methods';
import * as env from '#test-tools/env';
import posixJoin from '#tool/posixJoin';
import 'jest';
import path from 'path';

test('getHandlerFile', async () => {
  const files = await getHandlerFile(path.join(env.handlerPath, 'get'));

  const expectation = [
    posixJoin(env.handlerPath, 'get', 'justice', '[dc-league]', 'hello.ts'),
    posixJoin(env.handlerPath, 'get', 'justice', '[dc-league]', 'world.ts'),
    posixJoin(env.handlerPath, 'get', 'justice', 'world.ts'),
    posixJoin(env.handlerPath, 'get', 'po-ke', 'hello.ts'),
    posixJoin(env.handlerPath, 'get', 'po-ke', 'world.ts'),
    posixJoin(env.handlerPath, 'get', 'xman', 'fastify.ts'),
    posixJoin(env.handlerPath, 'get', 'xman', 'hello.ts'),
    posixJoin(env.handlerPath, 'get', 'xman', 'world.ts'),
  ];

  expect(files).toEqual(expectation);
});

test('getRoutePath', () => {
  const inputs = [
    posixJoin(env.handlerPath, 'post', 'avengers', 'heros', '[id]', 'hero.ts'),
    posixJoin(env.handlerPath, 'post', 'avengers', 'heros', 'index.ts'),
    posixJoin(env.handlerPath, 'post', 'avengers', 'heros.ts'),
    posixJoin(env.handlerPath, 'get', 'justice', '[dc-league]', 'hello.ts'),
    posixJoin(env.handlerPath, 'get', 'po-ke', 'hello.ts'),
  ];

  const routePaths = inputs.map((filename) => getRoutePath(filename));

  const expectation = [
    {
      filename: posixJoin(env.handlerPath, 'post/avengers/heros/[id]/hero.ts'),
      method: 'post',
      routePath: '/avengers/heros/:id/hero',
    },
    {
      filename: posixJoin(env.handlerPath, 'post/avengers/heros/index.ts'),
      method: 'post',
      routePath: '/avengers/heros',
    },
    {
      filename: posixJoin(env.handlerPath, 'post/avengers/heros.ts'),
      method: 'post',
      routePath: '/avengers/heros',
    },
    {
      filename: posixJoin(env.handlerPath, 'get/justice/[dc-league]/hello.ts'),
      method: 'get',
      routePath: '/justice/:dc-league/hello',
    },
    {
      filename: posixJoin(env.handlerPath, 'get/po-ke/hello.ts'),
      method: 'get',
      routePath: '/po-ke/hello',
    },
  ];

  expect(routePaths).toEqual(expectation);
});

test('getRouteFiles', async () => {
  const routeFiles = await proceedStage01(env.handlerPath, methods);

  const expectation = [
    {
      filename: posixJoin(env.handlerPath, 'delete/hello.ts'),
      method: 'delete',
      routePath: '/hello',
    },
    {
      filename: posixJoin(env.handlerPath, 'delete/world.ts'),
      method: 'delete',
      routePath: '/world',
    },
    {
      filename: posixJoin(env.handlerPath, 'get/justice/[dc-league]/hello.ts'),
      method: 'get',
      routePath: '/justice/:dc-league/hello',
    },
    {
      filename: posixJoin(env.handlerPath, 'get/justice/[dc-league]/world.ts'),
      method: 'get',
      routePath: '/justice/:dc-league/world',
    },
    {
      filename: posixJoin(env.handlerPath, 'get/justice/world.ts'),
      method: 'get',
      routePath: '/justice/world',
    },
    {
      filename: posixJoin(env.handlerPath, 'get/po-ke/hello.ts'),
      method: 'get',
      routePath: '/po-ke/hello',
    },
    {
      filename: posixJoin(env.handlerPath, 'get/po-ke/world.ts'),
      method: 'get',
      routePath: '/po-ke/world',
    },
    {
      filename: posixJoin(env.handlerPath, 'get/xman/fastify.ts'),
      method: 'get',
      routePath: '/xman/fastify',
    },
    {
      filename: posixJoin(env.handlerPath, 'get/xman/hello.ts'),
      method: 'get',
      routePath: '/xman/hello',
    },
    {
      filename: posixJoin(env.handlerPath, 'get/xman/world.ts'),
      method: 'get',
      routePath: '/xman/world',
    },
    {
      filename: posixJoin(env.handlerPath, 'post/avengers/heros.ts'),
      method: 'post',
      routePath: '/avengers/heros',
    },
    {
      filename: posixJoin(env.handlerPath, 'post/avengers/heros/[id]/hero.ts'),
      method: 'post',
      routePath: '/avengers/heros/:id/hero',
    },
    {
      filename: posixJoin(env.handlerPath, 'post/avengers/heros/index.ts'),
      method: 'post',
      routePath: '/avengers/heros',
    },
    {
      filename: posixJoin(env.handlerPath, 'post/dc/world.ts'),
      method: 'post',
      routePath: '/dc/world',
    },
    {
      filename: posixJoin(env.handlerPath, 'post/hello2.ts'),
      method: 'post',
      routePath: '/hello2',
    },
    {
      filename: posixJoin(env.handlerPath, 'put/hello.ts'),
      method: 'put',
      routePath: '/hello',
    },
    {
      filename: posixJoin(env.handlerPath, 'put/world.ts'),
      method: 'put',
      routePath: '/world',
    },
  ];

  expect(routeFiles).toStrictEqual(expectation);
});
