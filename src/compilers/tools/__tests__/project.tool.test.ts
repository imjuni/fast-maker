import { getTypeScriptConfig } from '#/compilers/tools/getTypeScriptConfig';
import { getTypeScriptProject } from '#/compilers/tools/getTypeScriptProject';
import { posixJoin } from '#/tools/posixJoin';
import { describe, expect, it } from 'vitest';

const tsconfigDir = posixJoin(process.cwd(), 'examples');
const tsconfigPath = posixJoin(tsconfigDir, 'tsconfig.example.json');

describe('getTypeScriptProject', () => {
  it('pass', async () => {
    const project = getTypeScriptProject(tsconfigPath);
    expect(project).toBeTruthy();
  });
});

describe('getTypeScriptConfig', () => {
  it('pass', async () => {
    const r01 = await getTypeScriptConfig(tsconfigPath);
    const expectation = {
      options: {
        lib: ['lib.es2023.d.ts'],
        module: 1,
        target: 9,
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        moduleResolution: 2,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        removeComments: true,
        importHelpers: true,
        noImplicitAny: false,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
        isolatedModules: true,
        baseUrl: tsconfigDir,
        rootDir: tsconfigDir,
        paths: { '#/*': ['interface/*'] },
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        pretty: true,
        pathsBasePath: tsconfigDir,
        configFilePath: undefined,
      },
      watchOptions: undefined,
      projectReferences: undefined,
      typeAcquisition: { enable: false, include: [], exclude: [] },
      raw: {
        compilerOptions: {
          module: 'CommonJS',
          moduleResolution: 'Node',
          declaration: true,
          declarationMap: true,
          sourceMap: true,
          outDir: './dist',
          removeComments: true,
          importHelpers: true,
          strict: true,
          noImplicitAny: false,
          noImplicitReturns: true,
          noFallthroughCasesInSwitch: true,
          isolatedModules: true,
          baseUrl: '.',
          rootDir: '.',
          paths: { '#/*': ['interface/*'] },
          esModuleInterop: true,
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          pretty: true,
        },
        compileOnSave: false,
      },
      errors: [],
      compileOnSave: false,
    };

    expect(r01.options).toMatchObject(expectation.options);
    expect(r01.raw.compilerOptions).toMatchObject(expectation.raw.compilerOptions);
  });
});
