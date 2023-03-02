import doMethodAggregator from '#modules/doMethodAggregator';
import evaluateVariablePath from '#routes/evaluateVariablePath';
import getHandlerFile from '#routes/getHandlerFile';
import getRoutePath from '#routes/getRoutePath';
import { CE_ROUTE_METHOD } from '#routes/interface/CE_ROUTE_METHOD';
import posixJoin from '#tools/posixJoin';
import * as env from '#tools/__tests__/tools/env';
import dayjs from 'dayjs';
import 'jest';

describe('getHandlerFile', () => {
  test('pass', async () => {
    const files = await getHandlerFile(
      [
        posixJoin(env.handlerPath, 'get', 'justice', '[dc-league]', 'hello.ts'),
        posixJoin(env.handlerPath, 'get', 'justice', '[dc-league]', 'world.ts'),
        posixJoin(env.handlerPath, 'get', 'justice', '[kind]-[id]', 'hello.ts'),
        posixJoin(env.handlerPath, 'get', 'justice', 'world.ts'),
        posixJoin(env.handlerPath, 'get', 'justice', 'world', '[id].ts'),
        posixJoin(env.handlerPath, 'get', 'po-ke', 'hello.ts'),
        posixJoin(env.handlerPath, 'get', 'po-ke', 'world.ts'),
        posixJoin(env.handlerPath, 'get', 'xman', 'fastify.ts'),
        posixJoin(env.handlerPath, 'get', 'xman', 'hello.ts'),
        posixJoin(env.handlerPath, 'get', 'xman', 'world.ts'),
      ],
      env.handlerPath,
      CE_ROUTE_METHOD.GET,
    );

    const expectation = [
      posixJoin(env.handlerPath, 'get', 'justice', '[dc-league]', 'hello.ts'),
      posixJoin(env.handlerPath, 'get', 'justice', '[dc-league]', 'world.ts'),
      posixJoin(env.handlerPath, 'get', 'justice', '[kind]-[id]', 'hello.ts'),
      posixJoin(env.handlerPath, 'get', 'justice', 'world.ts'),
      posixJoin(env.handlerPath, 'get', 'justice', 'world', '[id].ts'),
      posixJoin(env.handlerPath, 'get', 'po-ke', 'hello.ts'),
      posixJoin(env.handlerPath, 'get', 'po-ke', 'world.ts'),
      posixJoin(env.handlerPath, 'get', 'xman', 'fastify.ts'),
      posixJoin(env.handlerPath, 'get', 'xman', 'hello.ts'),
      posixJoin(env.handlerPath, 'get', 'xman', 'world.ts'),
    ];

    expect(files).toEqual(expectation);
  });
});

describe('evaluateVariablePath', () => {
  test('pass - 0 variable', async () => {
    const variable = await evaluateVariablePath('kind');
    expect(variable).toEqual('kind');
  });

  test('pass - 1 variable', async () => {
    const variable = await evaluateVariablePath('[kind]');
    expect(variable).toEqual(':kind');
  });

  test('pass - 2 variable', async () => {
    const variable = await evaluateVariablePath('[kind]-[id]');
    expect(variable).toEqual(':kind-:id');
  });

  test('pass - 3 variable', async () => {
    const variable = await evaluateVariablePath('[kind]-[id]-[pid]');
    expect(variable).toEqual(':kind-:id-:pid');
  });

  test('pass - 4 variable', async () => {
    const variable = await evaluateVariablePath('[kind]-[id]-[pid]-[name]');
    expect(variable).toEqual(':kind-:id-:pid-:name');
  });

  test('pass - 4 variable + literal', async () => {
    const variable = await evaluateVariablePath('[kind]-[id]-[pid]-[name]-test');
    expect(variable).toEqual(':kind-:id-:pid-:name-test');
  });

  test('pass - literal + 4 variable', async () => {
    const variable = await evaluateVariablePath('test-[kind]-[id]-[pid]-[name]');
    expect(variable).toEqual('test-:kind-:id-:pid-:name');
  });

  test('invalid - 0 variable', async () => {
    const variable = await evaluateVariablePath('[kind');
    expect(variable).toEqual('kind');
  });

  test('invalid - 0 variable', async () => {
    const variable = await evaluateVariablePath('[kind-[test');
    expect(variable).toEqual('kind-[test');
  });

  test('invalid - 1 variable', async () => {
    const variable = await evaluateVariablePath('[kind]-[test');
    expect(variable).toEqual(':kind-test');
  });

  test('invalid - 2 variable - start bracket', async () => {
    const variable = await evaluateVariablePath('[kind]-[test]-[[aa');
    expect(variable).toEqual(':kind-:test-[aa');
  });

  test('invalid - 2 variable - terminal bracket', async () => {
    const variable = await evaluateVariablePath('[kind]-[test]-aa]]');
    expect(variable).toEqual(':kind-:test-aa]]');
  });

  test('invalid - 0 variable', async () => {
    const variable = await evaluateVariablePath('kind]');
    expect(variable).toEqual('kind]');
  });

  test('exception - timeout', async () => {
    const spy = jest.spyOn(dayjs.prototype, 'diff').mockImplementationOnce(() => 50);
    try {
      await evaluateVariablePath('[kind]');
    } catch (caught) {
      expect(caught).toBeTruthy();
      spy.mockRestore();
    }
  });
});

describe('getRoutePath', () => {
  test('pass', async () => {
    const inputs = [
      posixJoin(env.handlerPath, 'post', 'avengers', 'heros', '[id]', 'hero.ts'),
      posixJoin(env.handlerPath, 'post', 'avengers', 'heros', '[kind]-[id]', 'hero.ts'),
      posixJoin(env.handlerPath, 'post', 'avengers', 'heros', 'index.ts'),
      posixJoin(env.handlerPath, 'post', 'avengers', 'heros.ts'),
      posixJoin(env.handlerPath, 'get', 'justice', '[dc-league]', 'hello.ts'),
      posixJoin(env.handlerPath, 'get', 'po-ke', 'hello.ts'),
    ];

    const routePaths = await Promise.all(inputs.map(async (filename) => getRoutePath(filename)));

    const expectation = [
      {
        filename: posixJoin(env.handlerPath, 'post/avengers/heros/[id]/hero.ts'),
        method: 'post',
        routePath: '/avengers/heros/:id/hero',
      },
      {
        filename: posixJoin(env.handlerPath, 'post/avengers/heros/[kind]-[id]/hero.ts'),
        method: 'post',
        routePath: '/avengers/heros/:kind-:id/hero',
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

  test('exception', async () => {
    try {
      const input = posixJoin(env.handlerPath, 'p1st-p1st', 'avengers', 'heros', '[id]', 'hero.ts');
      await getRoutePath(input);
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });
});

describe('getRouteFiles', () => {
  test('pass', async () => {
    const routeFiles = await doMethodAggregator(
      [
        posixJoin(env.handlerPath, 'get', 'justice', '[dc-league]', 'hello.ts'),
        posixJoin(env.handlerPath, 'get', 'justice', '[dc-league]', 'world.ts'),
        posixJoin(env.handlerPath, 'get', 'justice', '[kind]-[id]', 'hello.ts'),
        posixJoin(env.handlerPath, 'get', 'justice', 'world.ts'),
        posixJoin(env.handlerPath, 'get', 'justice', 'world', '[id].ts'),
        posixJoin(env.handlerPath, 'get', 'po-ke', 'hello.ts'),
        posixJoin(env.handlerPath, 'get', 'po-ke', 'world.ts'),
        posixJoin(env.handlerPath, 'get', 'xman', 'fastify.ts'),
        posixJoin(env.handlerPath, 'get', 'xman', 'hello.ts'),
        posixJoin(env.handlerPath, 'get', 'xman', 'world.ts'),
      ],
      { cwd: env.examplePath, handler: env.handlerPath },
    );

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
        filename: posixJoin(env.handlerPath, 'get/justice/[kind]-[id]/hello.ts'),
        method: 'get',
        routePath: '/justice/:kind-:id/hello',
      },
      {
        filename: posixJoin(env.handlerPath, 'get/justice/world.ts'),
        method: 'get',
        routePath: '/justice/world',
      },
      {
        filename: posixJoin(env.handlerPath, 'get/justice/world/[id].ts'),
        method: 'get',
        routePath: '/justice/world/:id',
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
});
