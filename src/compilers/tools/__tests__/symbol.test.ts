import { getRouteNode } from '#/compilers/routes/getRouteNode';
import { getTypeSymbolText } from '#/compilers/tools/getTypeSymbolText';
import { atOrThrow } from 'my-easy-fp';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import * as tsm from 'ts-morph';
import { describe, expect, it } from 'vitest';

const tsconfigDirPath = path.join(process.cwd(), 'examples');
const tsconfigFilePath = path.join(tsconfigDirPath, 'tsconfig.example.json');
const project = new tsm.Project({ tsConfigFilePath: tsconfigFilePath });
const context: { index: number } = { index: 0 };

describe('getTypeSymbolText', () => {
  it('without callback', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const sourcecode01 = `
import { FastifyRequest } from 'fastify';
import { ITestInfoType01 } from '#/ITestInfo';

export function handler(req: FastifyRequest<{ Querystring: ITestInfoType01 }>) {
  return 'hello';
}
    `.trim();

    const create = (name: string, code: string, overwrite?: boolean) =>
      project.createSourceFile(path.join('examples', name), code, { overwrite: overwrite ?? true });
    const sourceFile = create(filename01, sourcecode01);
    const node = getRouteNode(sourceFile);
    const parameters = node?.node.getParameters() ?? [];
    const parameter = atOrThrow(parameters, 0);
    const typeArgument = atOrThrow(parameter.getType().getTypeArguments(), 0);
    const r01 = getTypeSymbolText(typeArgument);

    expect(r01).toEqual('{ Querystring: ITestInfoType01 }');
  });

  it.only('without callback, alias type symbol', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const sourcecode01 = `
import { FastifyRequest } from 'fastify';
import TTypeParams from '#/ITestInfo';

export function handler(req: FastifyRequest<TTypeParams>) {
  return 'hello';
}
    `.trim();

    const create = (name: string, code: string, overwrite?: boolean) =>
      project.createSourceFile(path.join('examples', name), code, { overwrite: overwrite ?? true });
    const sourceFile = create(filename01, sourcecode01);
    const node = getRouteNode(sourceFile);
    const parameters = node?.node.getParameters() ?? [];
    const parameter = atOrThrow(parameters, 0);
    const typeArgument = atOrThrow(parameter.getType().getTypeArguments(), 0);
    const r01 = getTypeSymbolText(typeArgument);

    console.log(r01);
  });
});
