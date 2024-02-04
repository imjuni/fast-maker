import { getRouteNode } from '#/compilers/routes/getRouteNode';
import { getTypeReferences } from '#/compilers/type-tools/getTypeReferences';
import { isExternalModule } from '#/compilers/type-tools/isExternalModule';
import { randomUUID } from 'crypto';
import { atOrThrow } from 'my-easy-fp';
import path from 'path';
import * as tsm from 'ts-morph';
import { describe, expect, it } from 'vitest';

const tsconfigDirPath = path.join(process.cwd(), 'examples');
const tsconfigFile = 'tsconfig.example.json';
const project = new tsm.Project({ tsConfigFilePath: path.join(tsconfigDirPath, tsconfigFile) });
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

describe('getTypeReferences', () => {
  it('non dedupe, get type-reference', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `${optionsSourceCode}

export function handler(req: FastifyRequest<{ Body: IAbility }>) {
  return req.body;
}`;

    project.createSourceFile(filename01, abilityInterfaceSourceCode.trim(), { overwrite: true });
    const sourceFile02 = project.createSourceFile(filename02, source02.trim(), { overwrite: true });
    const routeNode = getRouteNode(sourceFile02);

    if (routeNode == null) {
      throw new Error('invalid route node');
    }

    const parameter = atOrThrow(routeNode.node.getParameters(), 0);
    const r01 = getTypeReferences(parameter, false);

    expect(r01.length).toEqual(2);
  });

  it('deduped, get type-reference', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `${optionsSourceCode}

export function handler(req: FastifyRequest<{ Body: IAbility, Querystring: IAbility }>) {
  return req.body;
}`;

    project.createSourceFile(filename01, abilityInterfaceSourceCode.trim(), { overwrite: true });
    const sourceFile02 = project.createSourceFile(filename02, source02.trim(), { overwrite: true });
    const routeNode = getRouteNode(sourceFile02);

    if (routeNode == null) {
      throw new Error('invalid route node');
    }

    const parameter = atOrThrow(routeNode.node.getParameters(), 0);
    const r01 = getTypeReferences(parameter);

    expect(r01.length).toEqual(2);
  });
});

describe('isExternalModule', () => {
  it('external module', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const sourceCode = `import { FastifyRequest } from 'fastify';`.trim();

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(path.join('examples', name), code, { overwrite });
    const sourceFile = create(filename01, sourceCode, true);

    const importDeclaration = atOrThrow(sourceFile.getImportDeclarations(), 0);
    const r01 = isExternalModule(importDeclaration);
    expect(r01).toBeTruthy();
  });

  it('project module', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const sourceCode = `import { ITestInfoType01 } from '#/ITestInfo';`.trim();

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(path.join('examples', name), code, { overwrite });
    const sourceFile = create(filename01, sourceCode, true);

    const importDeclaration = atOrThrow(sourceFile.getImportDeclarations(), 0);
    const r01 = isExternalModule(importDeclaration);
    expect(r01).toBeFalsy();
  });
});
