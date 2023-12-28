import { CE_DEFAULT_VALUE } from '#/configs/interfaces/CE_DEFAULT_VALUE';
import getConfigFilePath from '#/configs/interfaces/getConfigFilePath';
import * as env from '#/tools/__tests__/tools/env';
import 'jest';
import path from 'path';

describe('getConfigFilePath', () => {
  beforeEach(() => {
    process.env.USE_INIT_CWD = 'true';
    process.env.INIT_CWD = env.examplePath;
  });

  test('pass - c', () => {
    const file = getConfigFilePath({ c: path.join(env.examplePath, CE_DEFAULT_VALUE.CONFIG_FILE_NAME) });
    expect(file).toEqual(path.join(env.examplePath, CE_DEFAULT_VALUE.CONFIG_FILE_NAME));
  });

  test('pass - config', () => {
    const file = getConfigFilePath({ config: path.join(env.examplePath, CE_DEFAULT_VALUE.CONFIG_FILE_NAME) });
    expect(file).toEqual(path.join(env.examplePath, CE_DEFAULT_VALUE.CONFIG_FILE_NAME));
  });

  test('pass - tsconfig', () => {
    const file = getConfigFilePath({}, path.join(env.examplePath, CE_DEFAULT_VALUE.TSCONFIG_FILE_NAME));
    expect(file).toEqual(path.join(env.examplePath, CE_DEFAULT_VALUE.CONFIG_FILE_NAME));
  });

  test('pass - tsconfig', () => {
    const file = getConfigFilePath({}, path.join(env.examplePath, CE_DEFAULT_VALUE.TSCONFIG_FILE_NAME));
    expect(file).toEqual(path.join(env.examplePath, CE_DEFAULT_VALUE.CONFIG_FILE_NAME));
  });

  test('pass - no option', () => {
    const file = getConfigFilePath({});
    expect(file).toEqual(path.join(env.examplePath, CE_DEFAULT_VALUE.CONFIG_FILE_NAME));
  });

  test('pass - undefined', () => {
    process.env.INIT_CWD = __dirname;
    const file = getConfigFilePath({}, __dirname);
    expect(file).toBeUndefined();
  });
});
