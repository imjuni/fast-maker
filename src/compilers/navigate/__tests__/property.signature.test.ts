import { getPropertySignatures } from '#/compilers/navigate/getPropertySignatures';
import { getRouteFunctionOrThrow } from '#/compilers/routes/getRouteFunctionOrThrow';
import { atOrThrow } from 'my-easy-fp';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import * as tsm from 'ts-morph';
import { describe, expect, it } from 'vitest';

const tsconfigDir = path.join(process.cwd(), 'examples');
const tsconfigPath = path.join(tsconfigDir, 'tsconfig.example.json');
const project = new tsm.Project({ tsConfigFilePath: tsconfigPath });
const context: { index: number } = { index: 0 };

const importSourceCode = `
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { ITestInfoType01 } from '#/ITestInfo';`;

describe('getPropertySignatures', () => {
  it('property signatures from type literal', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const source01 = `${importSourceCode}

export function handler(req: { Q: { name: string }; B: { age: number} }) {
  return req.body;
}`;

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(path.join('examples', name), code, { overwrite });

    const sourceFile02 = create(filename01, source01.trim(), true);
    const node = getRouteFunctionOrThrow(sourceFile02);
    const parameter = atOrThrow(node.node.getParameters(), 0);

    const r01 = getPropertySignatures(parameter);
    expect(r01.map((s) => s.getEscapedName())).toEqual(['Q', 'B']);
  });

  it('property signatures from type alias', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const source01 = `${importSourceCode}

export function handler(req: ITestInfoType01) {
  return req.body;
}`;

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(path.join('examples', name), code, { overwrite });

    const sourceFile02 = create(filename01, source01.trim(), true);
    const node = getRouteFunctionOrThrow(sourceFile02);
    const parameter = atOrThrow(node.node.getParameters(), 0);

    const r01 = getPropertySignatures(parameter);
    expect(r01.map((s) => s.getEscapedName())).toEqual(['name', 'description', 'count']);
  });

  it('property signatures from generic type parameter', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const source01 = `${importSourceCode}

export function handler(req: FastifyRequest<ITestInfoType01>) {
  return req.body;
}`;

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(path.join('examples', name), code, { overwrite });

    const sourceFile02 = create(filename01, source01.trim(), true);
    const node = getRouteFunctionOrThrow(sourceFile02);
    const parameter = atOrThrow(node.node.getParameters(), 0);

    const r01 = getPropertySignatures(parameter);
    expect(r01.map((s) => s.getEscapedName())).toEqual(['name', 'description', 'count']);
  });

  it('empty property signature', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const source01 = `${importSourceCode}

export function handler(req: FastifyRequest) {
  return req.body;
}`;

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(path.join('examples', name), code, { overwrite });

    const sourceFile02 = create(filename01, source01.trim(), true);
    const node = getRouteFunctionOrThrow(sourceFile02);
    const parameter = atOrThrow(node.node.getParameters(), 0);

    const r01 = getPropertySignatures(parameter);
    expect(r01.length).toEqual(0);
  });
});
