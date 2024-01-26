import { getSymbol } from '#/compilers/navigate/getSymbol';
import { getRouteNode } from '#/compilers/routes/getRouteNode';
import { atOrThrow } from 'my-easy-fp';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import * as tsm from 'ts-morph';
import { describe, expect, it } from 'vitest';

const tsconfigPath = path.join(process.cwd(), 'examples', 'tsconfig.example.json');
const project = new tsm.Project({ tsConfigFilePath: tsconfigPath });
const context: { index: number } = { index: 0 };
const abilityInterfaceSourceCode = `
export interface IAbility {
  name: string;
  description: string;

  /** usage count of one day */
  count: number;
}`.trim();

describe('getSymbol', () => {
  it('plain symbol', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `
import { IAbility } from './${uuid}_0${(context.index += 1)}';

export function handler(param: { Querystring: IAbility }) {
  return 'hello';
}
    `.trim();

    project.createSourceFile(filename01, abilityInterfaceSourceCode, { overwrite: true });
    const sourceFile02 = project.createSourceFile(filename02, source02.trim(), { overwrite: true });
    const node = getRouteNode(sourceFile02);
    const parameters = node?.node.getParameters() ?? [];
    const parameter = atOrThrow(parameters, 0);
    const r01 = getSymbol(parameter.getType());

    expect(r01?.getEscapedName()).toEqual('__type');
  });

  it('plain symbol, not alias', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `
import { IAbility } from './${uuid}_0${(context.index += 1)}';
import { FastifyRequest, RouteShorthandOptions } from 'fastify';

export function handler(param: FastifyRequest<{ Querystring: IAbility }>) {
  return 'hello';
}
    `.trim();

    project.createSourceFile(filename01, abilityInterfaceSourceCode, { overwrite: true });
    const sourceFile02 = project.createSourceFile(filename02, source02.trim(), { overwrite: true });
    const node = getRouteNode(sourceFile02);
    const parameters = node?.node.getParameters() ?? [];
    const parameter = atOrThrow(parameters, 0);
    const r01 = getSymbol(parameter.getType());

    expect(r01?.getEscapedName()).toEqual('FastifyRequest');
  });

  it('not found', () => {
    const uuid = randomUUID();
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `export function handler(param: number) {
  return 'hello';
}
    `.trim();

    const sourceFile02 = project.createSourceFile(filename02, source02.trim(), { overwrite: true });
    const node = getRouteNode(sourceFile02);
    const parameters = node?.node.getParameters() ?? [];
    const parameter = atOrThrow(parameters, 0);
    const r01 = getSymbol(parameter.getType());

    expect(r01).toBeUndefined();
  });
});
