import { getGlobFiles } from '#/modules/files/getGlobFiles';
import { IncludeContainer } from '#/modules/scopes/IncludeContainer';
import { posixJoin } from '#/tools/posixJoin';
import { Glob } from 'glob';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { defaultExclude } from 'vitest/dist/config';

const tsconfigDir = path.join(process.cwd(), 'examples');

describe('IncludeContainer', () => {
  it('getter', () => {
    const container = new IncludeContainer({
      patterns: ['src/cli/**/*.ts', 'src/compilers/**/*.ts', 'examples/**/*.ts'],
      options: { absolute: true, ignore: defaultExclude, cwd: tsconfigDir },
    });

    expect(container.globs).toBeDefined();
    expect(container.map).toBeDefined();
  });

  it('isInclude - no glob files', () => {
    const container = new IncludeContainer({
      patterns: [],
      options: { absolute: true, ignore: defaultExclude, cwd: tsconfigDir },
    });

    const r01 = container.isInclude('src/files/IncludeContainer.ts');
    expect(r01).toBeFalsy();
  });

  it('isInclude', () => {
    const container = new IncludeContainer({
      patterns: ['src/cli/**/*.ts', 'src/compilers/**/*.ts', 'examples/**/*.ts'],
      options: { absolute: true, ignore: defaultExclude, cwd: process.cwd() },
    });

    const r01 = container.isInclude('src/files/IncludeContainer.ts');
    const r02 = container.isInclude('src/compilers/routes/getRouteHandler.ts');
    const r03 = container.isInclude(posixJoin(process.cwd(), 'src/files/IncludeContainer.ts'));
    const r04 = container.isInclude(posixJoin(process.cwd(), 'src/compilers/routes/getRouteHandler.ts'));

    expect(r01).toBeFalsy();
    expect(r02).toBeTruthy();
    expect(r03).toBeFalsy();
    expect(r04).toBeTruthy();
  });

  it('with exclusive glob isInclude', () => {
    const container = new IncludeContainer({
      patterns: [
        'src/cli/**/*.ts',
        'src/compilers/**/*.ts',
        '!src/compilers/tools/getTypeScriptProject.ts',
        'examples/**/*.ts',
      ],
      options: { absolute: true, ignore: defaultExclude, cwd: process.cwd() },
    });

    const r01 = container.isInclude('src/files/IncludeContainer.ts');
    const r02 = container.isInclude('src/compilers/routes/getRouteHandler.ts');
    const r03 = container.isInclude(posixJoin(process.cwd(), 'src/files/IncludeContainer.ts'));
    const r04 = container.isInclude(posixJoin(process.cwd(), 'src/compilers/routes/getRouteHandler.ts'));
    const r05 = container.isInclude(posixJoin(process.cwd(), 'src/cli/compilers/tools/getTypeScriptProject.ts'));

    expect(r01).toBeFalsy();
    expect(r02).toBeTruthy();
    expect(r03).toBeFalsy();
    expect(r04).toBeTruthy();
    expect(r05).toBeFalsy();
  });

  it('files - string path', () => {
    const expactation = getGlobFiles(
      new Glob('example/type03/**/*.ts', {
        ignore: defaultExclude,
        cwd: process.cwd(),
        absolute: true,
      }),
    );
    const container = new IncludeContainer({
      patterns: ['example/type03/**/*.ts'],
      options: { absolute: true, ignore: defaultExclude, cwd: tsconfigDir },
    });

    const r01 = container.files();

    expect(r01).toEqual(expactation);
  });
});
