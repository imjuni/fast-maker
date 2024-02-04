import { getTypeScriptConfig } from '#/compilers/tools/getTypeScriptConfig';
import { getTypeScriptProject } from '#/compilers/tools/getTypeScriptProject';
import { posixJoin } from '#/tools/posixJoin';
import { describe, expect, test } from 'vitest';

const tsconfigDir = posixJoin(process.cwd(), 'examples');
const tsconfigPath = posixJoin(tsconfigDir, 'tsconfig.example.json');

describe('getTypeScriptProject', () => {
  test('pass', async () => {
    const project = getTypeScriptProject(tsconfigPath);
    expect(project).toBeTruthy();
  });
});

describe('getTypeScriptConfig', () => {
  test('pass', async () => {
    const r = await getTypeScriptConfig(tsconfigPath);
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
