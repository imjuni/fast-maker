import { getCwd } from '#/modules/files/getCwd';
import { getResolvedPath } from '#/modules/files/getResolvedPath';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('getCwd', () => {
  it('empty env', () => {
    const r01 = getCwd({});
    expect(r01).toEqual(process.cwd());
  });

  it('use INIT_CWD but empty env', () => {
    const r01 = getCwd({ USE_INIT_CWD: 'true' });
    expect(r01).toEqual(process.cwd());
  });

  it('use INIT_CWD with env', () => {
    const r01 = getCwd({ USE_INIT_CWD: 'true', INIT_CWD: '/aaa' });
    expect(r01).toEqual('/aaa');
  });
});

describe('getResolvedPath', () => {
  it('absolute path', async () => {
    const r01 = await getResolvedPath('/a');
    expect(r01).toEqual('/a');
  });

  it('relative path', async () => {
    const r01 = await getResolvedPath('./tsconfig.json');
    expect(r01).toEqual(path.join(process.cwd(), 'tsconfig.json'));
  });

  it('relative path with not exists', async () => {
    const r01 = await getResolvedPath('./aa', process.cwd());
    expect(r01).toEqual(path.join(process.cwd(), 'aa'));
  });
});
