import summaryRouteHandlerFile from '#modules/summaryRouteHandlerFile';
import evaluateVariablePath from '#routes/evaluateVariablePath';
import getHandlerFile from '#routes/getHandlerFile';
import getRoutePath from '#routes/getRoutePath';
import { CE_ROUTE_METHOD } from '#routes/interface/CE_ROUTE_METHOD';
import posixJoin from '#tools/posixJoin';
import * as env from '#tools/__tests__/tools/env';
import loadSourceData from '#tools/__tests__/tools/loadSourceData';
import dayjs from 'dayjs';
import 'jest';
import * as mnf from 'my-node-fp';

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

  test('fail - not exists', async () => {
    const files = await getHandlerFile(
      [posixJoin(env.handlerPath, 'get', 'justice2', '[dc-league]', 'hello.ts')],
      env.handlerPath,
      CE_ROUTE_METHOD.GET,
    );

    expect(files).toMatchObject([]);
  });

  test('pass - not descendant', async () => {
    const files = await getHandlerFile(
      [posixJoin(env.handlerPath, 'get', 'justice', '[dc-league]', 'hello.ts')],
      'A',
      CE_ROUTE_METHOD.GET,
    );

    expect(files).toMatchObject([]);
  });

  test('pass - invalid method', async () => {
    const spy = jest.spyOn(mnf, 'exists').mockImplementationOnce(() => Promise.resolve(true));

    const files = await getHandlerFile(
      [posixJoin(env.handlerPath, 'ggg', 'justice', '[dc-league]', 'hello.ts')],
      env.handlerPath,
      CE_ROUTE_METHOD.GET,
    );

    spy.mockRestore();

    expect(files).toMatchObject([]);
  });

  test('pass - exception', async () => {
    const spy = jest.spyOn(mnf, 'exists').mockImplementationOnce(() => {
      throw new Error('want to raise error');
    });

    const files = await getHandlerFile(
      [posixJoin(env.handlerPath, 'ggg', 'justice', '[dc-league]', 'hello.ts')],
      env.handlerPath,
      CE_ROUTE_METHOD.GET,
    );

    spy.mockRestore();

    expect(files).toMatchObject([]);
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
        filePath: posixJoin(env.handlerPath, 'post/avengers/heros/[id]/hero.ts'),
        kind: 'route',
        method: 'post',
        routePath: '/avengers/heros/:id/hero',
      },
      {
        filePath: posixJoin(env.handlerPath, 'post/avengers/heros/[kind]-[id]/hero.ts'),
        kind: 'route',
        method: 'post',
        routePath: '/avengers/heros/:kind-:id/hero',
      },
      {
        filePath: posixJoin(env.handlerPath, 'post/avengers/heros/index.ts'),
        kind: 'route',
        method: 'post',
        routePath: '/avengers/heros',
      },
      {
        filePath: posixJoin(env.handlerPath, 'post/avengers/heros.ts'),
        kind: 'route',
        method: 'post',
        routePath: '/avengers/heros',
      },
      {
        filePath: posixJoin(env.handlerPath, 'get/justice/[dc-league]/hello.ts'),
        kind: 'route',
        method: 'get',
        routePath: '/justice/:dc-league/hello',
      },
      {
        filePath: posixJoin(env.handlerPath, 'get/po-ke/hello.ts'),
        kind: 'route',
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
    const routeFiles = await summaryRouteHandlerFile(
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

    const expectation = await loadSourceData<any>('default', __dirname, 'expects', 'expect.out.03.ts');

    expect(routeFiles).toMatchObject(expectation);
  });
});
