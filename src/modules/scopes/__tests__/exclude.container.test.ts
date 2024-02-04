import { ExcludeContainer } from '#/modules/scopes/ExcludeContainer';
import { posixJoin } from '#/tools/posixJoin';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { defaultExclude } from 'vitest/dist/config';

const tsconfigDir = path.join(process.cwd(), 'examples');

describe('ExcludeContainer', () => {
  it('getter', () => {
    const container = new ExcludeContainer({
      patterns: ['src/cli/**/*.ts', 'src/compilers/**/*.ts'],
      options: { absolute: true, ignore: defaultExclude, cwd: tsconfigDir },
      inlineExcludedFiles: [],
    });

    expect(container.globs).toBeDefined();
    expect(container.map).toBeDefined();
  });

  it('isExclude - no glob files', () => {
    const container = new ExcludeContainer({
      patterns: [],
      inlineExcludedFiles: [],
      options: { absolute: true, ignore: defaultExclude, cwd: tsconfigDir },
    });

    const r01 = container.isExclude('src/files/IncludeContainer.ts');
    expect(r01).toBeFalsy();
  });

  it('isExclude', () => {
    const container = new ExcludeContainer({
      patterns: ['src/cli/**/*.ts', 'src/compilers/**/*.ts'],
      inlineExcludedFiles: [
        {
          commentCode: 'inline exclude test',
          tag: 'ctix-exclude',
          pos: {
            line: 1,
            start: 1,
            column: 1,
          },
          workspaces: [],
          filePath: 'example/type03/ComparisonCls.tsx',
        },
        {
          commentCode: 'inline exclude test',
          tag: 'ctix-exclude',
          pos: {
            line: 1,
            start: 1,
            column: 1,
          },
          workspaces: [],
          filePath: path.resolve('example/type03/HandsomelyCls.tsx'),
        },
      ],
      options: { absolute: true, ignore: defaultExclude, cwd: process.cwd() },
    });

    const r01 = container.isExclude('src/files/IncludeContainer.ts');
    const r02 = container.isExclude('src/compilers/routes/getRouteHandler.ts');
    const r03 = container.isExclude(posixJoin(process.cwd(), 'src/modules/files/IncludeContainer.ts'));
    const r04 = container.isExclude(posixJoin(process.cwd(), 'src/compilers/routes/getRouteHandler.ts'));
    const r05 = container.isExclude(posixJoin(process.cwd(), 'src/compilers/navigate/getResolvedImportedModules.ts'));

    expect(r01).toBeFalsy();
    expect(r02).toBeTruthy();
    expect(r03).toBeFalsy();
    expect(r04).toBeTruthy();
    expect(r05).toBeTruthy();
  });

  it('isExclude', () => {
    const container = new ExcludeContainer({
      patterns: [
        'src/cli/**/*.ts',
        'src/compilers/**/*.ts',
        'examples/**/*.ts',
        '!src/compilers/getTypeScriptProject.ts',
      ],
      inlineExcludedFiles: [],
      options: { absolute: true, ignore: defaultExclude, cwd: process.cwd() },
    });

    const r01 = container.isExclude('src/files/IncludeContainer.ts');
    const r02 = container.isExclude('src/compilers/routes/getRouteHandler.ts');
    const r03 = container.isExclude(path.join(process.cwd(), 'src/files/IncludeContainer.ts'));
    const r04 = container.isExclude(path.join(process.cwd(), 'src/compilers/routes/getRouteHandler.ts'));
    const r05 = container.isExclude(path.join(process.cwd(), 'src/cli/compilers/getTypeScriptProject.ts'));

    expect(r01).toBeFalsy();
    expect(r02).toBeTruthy();
    expect(r03).toBeFalsy();
    expect(r04).toBeTruthy();
    expect(r05).toBeFalsy();
  });
});
