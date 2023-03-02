import getCwd from '#tools/getCwd';
import getRelativeCwd from '#tools/getRelativeCwd';
import posixJoin from '#tools/posixJoin';
import 'jest';
import path from 'path';

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
