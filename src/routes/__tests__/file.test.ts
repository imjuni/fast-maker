import summaryRouteHandlerFile from '#modules/summaryRouteHandlerFile';
import getSummaryByMethod from '#routes/getSummaryByMethod';
import * as env from '#tools/__tests__/tools/env';
import loadSourceData from '#tools/__tests__/tools/loadSourceData';
import 'jest';

describe('getSummaryByMethod', () => {
  test('pass', async () => {
    const inp = await loadSourceData<string[]>('default', __dirname, 'expects', 'expect.inp.01.ts');
    const r = getSummaryByMethod(inp, { handler: env.handlerPath, cwd: env.handlerPath });
    const out = await loadSourceData<string[]>('default', __dirname, 'expects', 'expect.out.01.ts');

    expect(r).toMatchObject(out);

    console.log(r);
  });
});

describe('summaryRouteHandlerFile', () => {
  test('pass', async () => {
    const inp = await loadSourceData<string[]>('default', __dirname, 'expects', 'expect.inp.02.ts');
    const r = await summaryRouteHandlerFile(inp, { handler: env.handlerPath, cwd: env.handlerPath });
    const expectation = await loadSourceData<any>('default', __dirname, 'expects', 'expect.out.02.ts');

    expect(r).toMatchObject(expectation);
  });
});
