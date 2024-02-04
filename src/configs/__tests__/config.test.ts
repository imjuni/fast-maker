import { CE_DEFAULT_VALUE } from '#/configs/const-enum/CE_DEFAULT_VALUE';
import { getConfigFilePath } from '#/configs/interfaces/getConfigFilePath';
import { posixJoin } from '#/tools/posixJoin';
import { beforeEach, describe, expect, it } from 'vitest';

const tsconfigDir = posixJoin(process.cwd(), 'examples');

describe('getConfigFilePath', () => {
  beforeEach(() => {
    process.env.USE_INIT_CWD = 'true';
    process.env.INIT_CWD = tsconfigDir;
  });

  it('pass - c', () => {
    const file = getConfigFilePath({ c: posixJoin(tsconfigDir, CE_DEFAULT_VALUE.CONFIG_FILE_NAME) });
    expect(file).toEqual(posixJoin(tsconfigDir, CE_DEFAULT_VALUE.CONFIG_FILE_NAME));
  });

  it('pass - config', () => {
    const file = getConfigFilePath({ config: posixJoin(tsconfigDir, CE_DEFAULT_VALUE.CONFIG_FILE_NAME) });
    expect(file).toEqual(posixJoin(tsconfigDir, CE_DEFAULT_VALUE.CONFIG_FILE_NAME));
  });

  it('pass - tsconfig', () => {
    const file = getConfigFilePath({}, posixJoin(tsconfigDir, CE_DEFAULT_VALUE.TSCONFIG_FILE_NAME));
    expect(file).toEqual(posixJoin(tsconfigDir, CE_DEFAULT_VALUE.CONFIG_FILE_NAME));
  });

  it('pass - tsconfig', () => {
    const file = getConfigFilePath({}, posixJoin(tsconfigDir, CE_DEFAULT_VALUE.TSCONFIG_FILE_NAME));
    expect(file).toEqual(posixJoin(tsconfigDir, CE_DEFAULT_VALUE.CONFIG_FILE_NAME));
  });

  it('pass - no option', () => {
    const file = getConfigFilePath({});
    expect(file).toEqual(posixJoin(tsconfigDir, CE_DEFAULT_VALUE.CONFIG_FILE_NAME));
  });

  it('pass - undefined', () => {
    process.env.INIT_CWD = __dirname;
    const file = getConfigFilePath({}, __dirname);
    expect(file).toBeUndefined();
  });
});
