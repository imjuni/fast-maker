import { CE_DEFAULT_VALUE } from '#configs/interfaces/CE_DEFAULT_VALUE';
import getConfigFilePath from '#configs/interfaces/getConfigFilePath';
import * as env from '#tools/__tests__/tools/env';
import 'jest';
import path = require('path');

describe('getConfigFilePath', () => {
  test('pass - c', () => {
    process.env.INIT_CWD = env.examplePath;
    const file = getConfigFilePath({ c: path.join(env.examplePath, CE_DEFAULT_VALUE.CONFIG_FILE_NAME) });
    expect(file).toEqual(path.join(env.examplePath, CE_DEFAULT_VALUE.CONFIG_FILE_NAME));
  });

  test('pass - config', () => {
    process.env.INIT_CWD = env.examplePath;
    const file = getConfigFilePath({ config: path.join(env.examplePath, CE_DEFAULT_VALUE.CONFIG_FILE_NAME) });
    expect(file).toEqual(path.join(env.examplePath, CE_DEFAULT_VALUE.CONFIG_FILE_NAME));
  });

  test('pass - tsconfig', () => {
    process.env.INIT_CWD = env.examplePath;
    const file = getConfigFilePath({}, path.join(env.examplePath, CE_DEFAULT_VALUE.TSCONFIG_FILE_NAME));
    expect(file).toEqual(path.join(env.examplePath, CE_DEFAULT_VALUE.CONFIG_FILE_NAME));
  });

  test('pass - tsconfig', () => {
    process.env.INIT_CWD = env.examplePath;
    const file = getConfigFilePath({}, path.join(env.examplePath, CE_DEFAULT_VALUE.TSCONFIG_FILE_NAME));
    expect(file).toEqual(path.join(env.examplePath, CE_DEFAULT_VALUE.CONFIG_FILE_NAME));
  });

  test('pass - no option', () => {
    process.env.INIT_CWD = env.examplePath;
    const file = getConfigFilePath({});
    expect(file).toEqual(path.join(env.examplePath, CE_DEFAULT_VALUE.CONFIG_FILE_NAME));
  });

  test('pass - undefined', () => {
    process.env.INIT_CWD = __dirname;
    const file = getConfigFilePath({}, __dirname);
    expect(file).toBeUndefined();
  });
});
