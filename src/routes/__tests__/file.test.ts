import { CE_ROUTE_METHOD } from '#/routes/const-enum/CE_ROUTE_METHOD';
import getMethod from '#/routes/getMethod';
import summaryRouteHandlerFile from '#/routes/summaryRoutePath';
import summaryRouteHandlerFiles from '#/routes/summaryRoutePaths';
import * as env from '#/tools/__tests__/tools/env';
import loadSourceData from '#/tools/__tests__/tools/loadSourceData';
import posixJoin from '#/tools/posixJoin';
import 'jest';

describe('summaryRouteHandlerFile', () => {
  test('pass', async () => {
    const r = await summaryRouteHandlerFile(
      posixJoin(env.handlerPath, CE_ROUTE_METHOD.GET, 'justice', '[dc-league]', 'hello.ts'),
      {
        handler: env.handlerPath,
        cwd: env.handlerPath,
      },
    );

    expect(r).toMatchObject({
      kind: 'route',
      filePath: posixJoin(env.handlerPath, CE_ROUTE_METHOD.GET, 'justice', '[dc-league]', 'hello.ts'),
      method: 'get',
      routePath: '/justice/:dc-league/hello',
    });
  });
});

describe('summaryRouteHandlerFiles', () => {
  test('pass', async () => {
    const inp = await loadSourceData<string[]>('default', __dirname, 'expects', 'expect.inp.02.ts');
    const r = await summaryRouteHandlerFiles(inp, { handler: env.handlerPath, cwd: env.handlerPath });
    const expectation = await loadSourceData<any>('default', __dirname, 'expects', 'expect.out.02.ts');

    expect(r).toMatchObject(expectation);
  });
});

describe('getMethod', () => {
  test('pass', async () => {
    try {
      getMethod('A');
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });
});
