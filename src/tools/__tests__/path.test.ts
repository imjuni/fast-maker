import { CE_EXT_KIND } from '#/configs/const-enum/CE_EXT_KIND';
import { getNextExtName } from '#/tools/getNextExtName';
import { getRelativeModulePath } from '#/tools/getRelativeModulePath';
import { removeHandlerPath } from '#/tools/removeHandlerPath';
import { describe, expect, it } from 'vitest';

describe('removeHandlerPath', () => {
  it('successfully get relative route path', () => {
    const r01 = removeHandlerPath('/a/b/c/d/e/f/get.ts', '/a/b/c/d');
    expect(r01).toEqual('/e/f/get.ts');
  });
});

describe('getNextExtName', () => {
  it('check every case of getNextExtName', () => {
    const r01 = getNextExtName(CE_EXT_KIND.JS, '.ts');
    const r02 = getNextExtName(CE_EXT_KIND.CJS, '.ts');
    const r03 = getNextExtName(CE_EXT_KIND.MJS, '.ts');
    const r04 = getNextExtName(CE_EXT_KIND.TS, '.ts');
    const r05 = getNextExtName(CE_EXT_KIND.MTS, '.ts');
    const r06 = getNextExtName(CE_EXT_KIND.CTS, '.ts');
    const r07 = getNextExtName(CE_EXT_KIND.KEEP, '.js');
    const r08 = getNextExtName(CE_EXT_KIND.KEEP, '.cjs');
    const r09 = getNextExtName(CE_EXT_KIND.KEEP, '.mjs');
    const r10 = getNextExtName(CE_EXT_KIND.KEEP, '.ts');
    const r11 = getNextExtName(CE_EXT_KIND.KEEP, '.mts');
    const r12 = getNextExtName(CE_EXT_KIND.KEEP, '.cts');
    const r13 = getNextExtName(CE_EXT_KIND.NONE, '.ts');

    expect(r01).toEqual('.js');
    expect(r02).toEqual('.cjs');
    expect(r03).toEqual('.mjs');
    expect(r04).toEqual('.ts');
    expect(r05).toEqual('.mts');
    expect(r06).toEqual('.cts');
    expect(r07).toEqual('.js');
    expect(r08).toEqual('.cjs');
    expect(r09).toEqual('.mjs');
    expect(r10).toEqual('.ts');
    expect(r11).toEqual('.mts');
    expect(r12).toEqual('.cts');
    expect(r13).toEqual('');
  });
});

describe.only('getRelativeModulePath', () => {
  it('ext-kind none, module path start dot', () => {
    const r01 = getRelativeModulePath({
      output: '/a/b/c/d/handlers',
      modulePath: '/a/b/c/d/module/file/getName.ts',
      extKind: CE_EXT_KIND.NONE,
    });

    expect(r01).toEqual('../module/file/getName');
  });

  it('ext-kind none, module path start dot', () => {
    const r01 = getRelativeModulePath({
      output: '/a/b/c/d/handlers',
      modulePath: '/a/b/c/d/handlers/file/getName.ts',
      extKind: CE_EXT_KIND.MTS,
    });

    expect(r01).toEqual('./file/getName.mts');
  });
});
