import getResolvedPaths from '#configs/getResolvedPaths';
import getCwd from '#tools/getCwd';
import getRelativeCwd from '#tools/getRelativeCwd';
import posixJoin from '#tools/posixJoin';
import JestContext from '#tools/__tests__/tools/context';
import * as env from '#tools/__tests__/tools/env';
import 'jest';
import path from 'path';

describe('JestContext', () => {
  test('pass', () => {
    const ctx = new JestContext();
    ctx.watchOption = { ...env.option, ...env.watchOption, ...getResolvedPaths(env.option) };
    expect(ctx.watchOption).toMatchObject({ ...env.option, ...env.watchOption, ...getResolvedPaths(env.option) });
  });

  test('fail', () => {
    const ctx = new JestContext();

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      ctx.project;
    } catch (caught) {
      expect(caught).toBeTruthy();
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      ctx.projectPath;
    } catch (caught) {
      expect(caught).toBeTruthy();
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      ctx.routeOption;
    } catch (caught) {
      expect(caught).toBeTruthy();
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      ctx.watchOption;
    } catch (caught) {
      expect(caught).toBeTruthy();
    }
  });
});

describe('getRativeCwd', () => {
  test('default', () => {
    expect(getRelativeCwd('/a/b/c', '/a/b/c/d/test.ts')).toEqual('d/test.ts');
  });
});

describe('posixJoin', () => {
  test('join path', () => {
    const joined = posixJoin('hello', 'world');
    expect(joined).toEqual('hello/world');
  });
});

describe('getCwd', () => {
  test('cwd', () => {
    const r01 = getCwd({});
    const e = path.resolve('.');

    expect(r01).toEqual(e);

    const r02 = getCwd({ INIT_CWD: '/examples' });
    expect(r02).toEqual('/examples');
  });
});
