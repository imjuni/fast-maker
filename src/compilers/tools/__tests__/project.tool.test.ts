import getTypeScriptConfig from '#compilers/tools/getTypeScriptConfig';
import getTypeScriptProject from '#compilers/tools/getTypeScriptProject';
import * as env from '#tools/__tests__/tools/env';
import 'jest';
import path from 'path';

describe('getTypeScriptProject', () => {
  test('pass', async () => {
    const project = await getTypeScriptProject(path.join(env.examplePath, 'tsconfig.json'));
    expect(project).toBeTruthy();
  });
});

describe('getTypeScriptConfig', () => {
  test('pass', async () => {
    const r = await getTypeScriptConfig(path.join(env.examplePath, 'tsconfig.json'));
    const expectation = {
      options: {
        target: 8,
        module: 1,
        lib: ['lib.es2021.d.ts'],
        declaration: true,
        removeComments: false,
        strict: true,
        moduleResolution: 2,
        esModuleInterop: true,
        inlineSourceMap: true,
        configFilePath: undefined,
      },
      watchOptions: undefined,
      projectReferences: undefined,
      typeAcquisition: { enable: false, include: [], exclude: [] },
      raw: {
        compilerOptions: {
          target: 'es2021',
          module: 'commonjs',
          declaration: true,
          outDir: 'dist',
          removeComments: false,
          strict: true,
          moduleResolution: 'node',
          baseUrl: '.',
          esModuleInterop: true,
          inlineSourceMap: true,
        },
        compileOnSave: false,
      },
      errors: [],
      compileOnSave: false,
    };

    expect(r).toMatchObject(expectation);
  });
});
