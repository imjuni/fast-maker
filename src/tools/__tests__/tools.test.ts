import { getCwd } from '#/modules/files/getCwd';
import { getRelativeCwd } from '#/tools/getRelativeCwd';
import { removeQuote } from '#/tools/removeQuote';
import path from 'node:path';
import { describe, expect, it, vitest } from 'vitest';

describe('getRelativeCwd', () => {
  it('pass case of getRelativeCwd', () => {
    expect(getRelativeCwd('/a/b/c', '/a/b/c/d/test.ts')).toEqual('d/test.ts');
  });
});

describe.only('removeQuote', () => {
  it('single quote', () => {
    const r01 = removeQuote(`'hello'`);
    expect(r01).toEqual('hello');
  });

  it('double quote', () => {
    const r01 = removeQuote(`"world"`);
    expect(r01).toEqual('world');
  });

  it('non quote', () => {
    const r01 = removeQuote(`typescript`);
    expect(r01).toEqual('typescript');
  });

  it('empty string', () => {
    vitest.spyOn(String.prototype, 'trim').mockImplementationOnce(() => {
      throw Error('raise error');
    });

    const r01 = removeQuote(' test ');
    expect(r01).toEqual(' test ');
  });
});

describe('getCwd', () => {
  it('test every case of getCwd', () => {
    const r01 = getCwd({});
    const e = path.resolve('.');

    expect(r01).toEqual(e);

    const r02 = getCwd({ USE_INIT_CWD: 'true', INIT_CWD: '/examples' });
    expect(r02).toEqual('/examples');

    const r03 = getCwd({ USE_INIT_CWD: 'false', INIT_CWD: '/examples' });
    expect(r03).toEqual(process.cwd());

    const r04 = getCwd({ INIT_CWD: '/examples' });
    expect(r04).toEqual(process.cwd());

    const r05 = getCwd({ USE_INIT_CWD: 'true' });
    const e2 = path.resolve('.');

    expect(r05).toEqual(e2);
  });
});
