import { getRouteNode } from '#/compilers/routes/getRouteNode';
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
const optionsSourceCode =
  `export const map: Map<string, string> = new Map<string, string>([['time', ':hour(^\\d{2})h:minute(^\\d{2})m']]);

export const methods: number = ['SEARCH'];

export const option: RouteShorthandOptions = {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
      },
      required: ['name'],
    },
    body: {
      type: 'object',
      properties: {
        weight: {
          type: 'string',
        },
        age: {
          type: 'number',
        },
      },
      required: ['weight', 'age'],
    },
  },
};`.trim();

describe('getRouteOptions', () => {
  it('synchronous function', () => {
    const uuid = randomUUID();

    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `${optionsSourceCode}

export function handler(req: FastifyRequest<{ Body: IAbility }>) {
  return req.body;
}`;

    project.createSourceFile(filename01, abilityInterfaceSourceCode.trim(), { overwrite: true });
    const sourceFile02 = project.createSourceFile(filename02, source02.trim(), { overwrite: true });

    const r01 = getRouteNode(sourceFile02);

    // @ts-expect-error
    delete r01?.node;

    expect(r01).toMatchObject({
      kind: 'sync',
      type: 'function',
      name: 'handler',
    });
  });

  it('asynchronous function', () => {
    const uuid = randomUUID();

    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `${optionsSourceCode}

export async function handler(req: FastifyRequest<{ Body: IAbility }>) {
  return req.body;
}`;

    project.createSourceFile(filename01, abilityInterfaceSourceCode.trim(), { overwrite: true });
    const sourceFile02 = project.createSourceFile(filename02, source02.trim(), { overwrite: true });

    const r01 = getRouteNode(sourceFile02);

    // @ts-expect-error
    delete r01?.node;

    expect(r01).toMatchObject({
      kind: 'async',
      type: 'function',
      name: 'handler',
    });
  });

  it('synchronous arrow function', () => {
    const uuid = randomUUID();

    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `${optionsSourceCode}

export const handler = (req: FastifyRequest<{ Body: IAbility }>) => {
  return req.body;
}`;

    project.createSourceFile(filename01, abilityInterfaceSourceCode.trim(), { overwrite: true });
    const sourceFile02 = project.createSourceFile(filename02, source02.trim(), { overwrite: true });
    const r01 = getRouteNode(sourceFile02);

    // @ts-expect-error
    delete r01?.node;

    expect(r01).toMatchObject({
      kind: 'sync',
      type: 'arrow',
      name: 'handler',
    });
  });

  it('asynchronous arrow function', () => {
    const uuid = randomUUID();

    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `${optionsSourceCode}

export const handler = async (req: FastifyRequest<{ Body: IAbility }>) => {
  return req.body;
}`;

    project.createSourceFile(filename01, abilityInterfaceSourceCode.trim(), { overwrite: true });
    const sourceFile02 = project.createSourceFile(filename02, source02.trim(), { overwrite: true });
    const r01 = getRouteNode(sourceFile02);

    // @ts-expect-error
    delete r01?.node;

    expect(r01).toMatchObject({
      kind: 'async',
      type: 'arrow',
      name: 'handler',
    });
  });

  it('source code does not function or arrow function', () => {
    const uuid = randomUUID();

    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `${optionsSourceCode}

export type handler = { a: number };`;

    project.createSourceFile(filename01, abilityInterfaceSourceCode.trim(), { overwrite: true });
    const sourceFile02 = project.createSourceFile(filename02, source02.trim(), { overwrite: true });
    const r01 = getRouteNode(sourceFile02);

    expect(r01).toBeUndefined();
  });

  it('source code does not function or arrow function, but handler variable', () => {
    const uuid = randomUUID();

    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `${optionsSourceCode}

export const handler: number = 1;`;

    project.createSourceFile(filename01, abilityInterfaceSourceCode.trim(), { overwrite: true });
    const sourceFile02 = project.createSourceFile(filename02, source02.trim(), { overwrite: true });
    const r01 = getRouteNode(sourceFile02);

    expect(r01).toBeUndefined();
  });

  it('source code does not have a handler', () => {
    const uuid = randomUUID();

    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `${optionsSourceCode}

export type hello = { a: number };`;

    project.createSourceFile(filename01, abilityInterfaceSourceCode.trim(), { overwrite: true });
    const sourceFile02 = project.createSourceFile(filename02, source02.trim(), { overwrite: true });
    const r01 = getRouteNode(sourceFile02);

    expect(r01).toBeUndefined();
  });
});
