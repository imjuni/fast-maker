import getHandlerStatement from '#compilers/navigate/getHandlerStatement';
import getOptionStatement from '#compilers/navigate/getOptionStatement';
import JestContext from '#tools/__tests__/tools/context';
import 'jest';
import { Project } from 'ts-morph';

const context = new JestContext();

beforeAll(() => {
  context.project = new Project();
});

describe('getOptionStatement', () => {
  test('pass', () => {
    const source = `export const option = {}`;
    context.project.createSourceFile('t.ts', source, { overwrite: true });

    const sourceFile = context.project.getSourceFile('t.ts')!;
    const map = sourceFile.getExportedDeclarations();

    const result = getOptionStatement(map.get('option'));
    expect(result?.kind).toEqual('option');
  });

  test('fail', () => {
    const source = `export const not_option = {}`;
    context.project.createSourceFile('t.ts', source, { overwrite: true });

    const sourceFile = context.project.getSourceFile('t.ts')!;
    const map = sourceFile.getExportedDeclarations();

    const result = getOptionStatement(map.get('option'));
    expect(result?.kind).toBeUndefined();
  });
});

describe('getHandlerStatement', () => {
  test('pass - named function', () => {
    const source = `export default function handler() {}`;
    context.project.createSourceFile('t.ts', source, { overwrite: true });

    const sourceFile = context.project.getSourceFile('t.ts')!;
    const map = sourceFile.getExportedDeclarations();

    const result = getHandlerStatement(map.get('default'));
    expect(result?.kind).toEqual('handler');
  });

  test('pass - non-named function', () => {
    const source = `export default function () {}`;
    context.project.createSourceFile('t.ts', source, { overwrite: true });

    const sourceFile = context.project.getSourceFile('t.ts')!;
    const map = sourceFile.getExportedDeclarations();

    const result = getHandlerStatement(map.get('default'));
    expect(result?.kind).toEqual('handler');
  });

  test('pass - named arrow function', () => {
    const source = `const async named = async () => {}; export default named`;
    context.project.createSourceFile('t.ts', source, { overwrite: true });

    const sourceFile = context.project.getSourceFile('t.ts')!;
    const map = sourceFile.getExportedDeclarations();

    const result = getHandlerStatement(map.get('default'));
    expect(result?.kind).toEqual('handler');
  });

  test('pass - named arrow function', () => {
    const source = `export default async () => {};`;
    context.project.createSourceFile('t.ts', source, { overwrite: true });

    const sourceFile = context.project.getSourceFile('t.ts')!;
    const map = sourceFile.getExportedDeclarations();

    const result = getHandlerStatement(map.get('default'));
    expect(result?.kind).toEqual('handler');
  });

  test('pass - empty - not export', () => {
    const source = `const a = 1`;
    context.project.createSourceFile('t.ts', source, { overwrite: true });

    const sourceFile = context.project.getSourceFile('t.ts')!;
    const map = sourceFile.getExportedDeclarations();

    const result = getHandlerStatement(map.get('default'));
    expect(result).toBeUndefined();
  });

  test('pass - empty - not export handler', () => {
    const source = `const a = 1; export default a;`;
    context.project.createSourceFile('t.ts', source, { overwrite: true });

    const sourceFile = context.project.getSourceFile('t.ts')!;
    const map = sourceFile.getExportedDeclarations();

    const result = getHandlerStatement(map.get('default'));
    expect(result).toBeUndefined();
  });

  test('pass - empty - not export handler', () => {
    const source = `export default class Test {}`;
    context.project.createSourceFile('t.ts', source, { overwrite: true });

    const sourceFile = context.project.getSourceFile('t.ts')!;
    const map = sourceFile.getExportedDeclarations();

    const result = getHandlerStatement(map.get('default'));
    expect(result).toBeUndefined();
  });
});
