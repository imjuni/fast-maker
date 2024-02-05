import { getRouteFunctionOrThrow } from '#/compilers/routes/getRouteFunctionOrThrow';
import { getTypeReferences } from '#/compilers/type-tools/getTypeReferences';
import { validateTypeReferences } from '#/compilers/validators/validateTypeReferences';
import { posixJoin } from '#/tools/posixJoin';
import { atOrThrow } from 'my-easy-fp';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import * as tsm from 'ts-morph';
import { describe, expect, it } from 'vitest';

const tsconfigDir = path.join(process.cwd(), 'examples');
const tsconfigPath = path.join(tsconfigDir, 'tsconfig.example.json');
const project = new tsm.Project({ tsConfigFilePath: tsconfigPath });
const context: { index: number } = { index: 0 };
const abilityInterfaceSourceCode = `
export interface IAbility {
  name: string;
  description: string;

  /** usage count of one day */
  count: number;
}`.trim();

describe('validateTypeReferences', () => {
  it('un-exported type-alias', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `
import { ITestInfoType01 } from '#/ITestInfo';
import { FastifyRequest } from 'fastify';

type TBody = {
  name: string;
  age: number;
}

export function handler(req: FastifyRequest<{ Querystring: ITestInfoType01; Body: TBody }>) {
  return 'hello';
}`.trim();

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(path.join('examples', name), code, { overwrite });

    create(filename01, abilityInterfaceSourceCode, true);

    const sourceFile02 = create(filename02, source02.trim(), true);
    const node = getRouteFunctionOrThrow(sourceFile02);
    const parameters = node.node.getParameters();
    const parameter = atOrThrow(parameters, 0);
    const typereferences = getTypeReferences(parameter);

    const r01 = validateTypeReferences(sourceFile02, typereferences);
    expect(r01.at(0)).toMatchObject({
      type: 'error',
      filePath: posixJoin(tsconfigDir, filename02),
      lineAndCharacter: { line: 4, character: 1 },
      message: 'not export type-alias: TBody',
    });
  });

  it('un-exported interface', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `
import { ITestInfoType01 } from '#/ITestInfo';
import { FastifyRequest } from 'fastify';

interface IBody {
  name: string;
  age: number;
}

export function handler(req: FastifyRequest<{ Querystring: ITestInfoType01; Body: IBody }>) {
  return 'hello';
}`.trim();

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(path.join('examples', name), code, { overwrite });

    create(filename01, abilityInterfaceSourceCode, true);

    const sourceFile02 = create(filename02, source02.trim(), true);
    const node = getRouteFunctionOrThrow(sourceFile02);
    const parameters = node.node.getParameters();
    const parameter = atOrThrow(parameters, 0);
    const typereferences = getTypeReferences(parameter);

    const r01 = validateTypeReferences(sourceFile02, typereferences);
    expect(r01.at(0)).toMatchObject({
      type: 'error',
      filePath: posixJoin(tsconfigDir, filename02),
      lineAndCharacter: { line: 4, character: 1 },
      message: 'not export interface: IBody',
    });
  });

  it('un-exported class', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `
import { ITestInfoType01 } from '#/ITestInfo';
import { FastifyRequest } from 'fastify';

class CBody {
  name: string;
  age: number;
}

export function handler(req: FastifyRequest<{ Querystring: ITestInfoType01; Body: CBody }>) {
  return 'hello';
}`.trim();

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(path.join('examples', name), code, { overwrite });

    create(filename01, abilityInterfaceSourceCode, true);

    const sourceFile02 = create(filename02, source02.trim(), true);
    const node = getRouteFunctionOrThrow(sourceFile02);
    const parameters = node.node.getParameters();
    const parameter = atOrThrow(parameters, 0);
    const typereferences = getTypeReferences(parameter);

    const r01 = validateTypeReferences(sourceFile02, typereferences);
    expect(r01.at(0)).toMatchObject({
      type: 'error',
      filePath: posixJoin(tsconfigDir, filename02),
      lineAndCharacter: { line: 4, character: 1 },
      message: 'not export class: CBody',
    });
  });

  it('un-exported intersection type', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `
import { ITestInfoType01 } from '#/ITestInfo';
import { FastifyRequest } from 'fastify';

interface IBodyPerson {
  name: string;
  age: number;
}

type TBodyGreeting {
  hello: string
}

export function handler(req: FastifyRequest<{ Querystring: ITestInfoType01; Body: IBodyPerson & TBodyGreeting }>) {
  return 'hello';
}`.trim();

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(path.join('examples', name), code, { overwrite });

    create(filename01, abilityInterfaceSourceCode, true);

    const sourceFile02 = create(filename02, source02.trim(), true);
    const node = getRouteFunctionOrThrow(sourceFile02);
    const parameters = node.node.getParameters();
    const parameter = atOrThrow(parameters, 0);
    const typereferences = getTypeReferences(parameter);

    const r01 = validateTypeReferences(sourceFile02, typereferences);

    expect(r01.at(0)).toMatchObject({
      type: 'error',
      filePath: posixJoin(tsconfigDir, filename02),
      lineAndCharacter: { line: 9, character: 1 },
      message: 'not export type-alias: TBodyGreeting',
    });

    expect(r01.at(1)).toMatchObject({
      type: 'error',
      filePath: posixJoin(tsconfigDir, filename02),
      lineAndCharacter: { line: 4, character: 1 },
      message: 'not export interface: IBodyPerson',
    });
  });

  it('un-exported union type', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `
import { ITestInfoType01 } from '#/ITestInfo';
import { FastifyRequest } from 'fastify';

interface IBodyPerson {
  name: string;
  age: number;
}

type TBodyGreeting {
  hello: string
}

export function handler(req: FastifyRequest<{ Querystring: ITestInfoType01; Body: IBodyPerson | TBodyGreeting }>) {
  return 'hello';
}`.trim();

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(path.join('examples', name), code, { overwrite });

    create(filename01, abilityInterfaceSourceCode, true);

    const sourceFile02 = create(filename02, source02.trim(), true);
    const node = getRouteFunctionOrThrow(sourceFile02);
    const parameters = node.node.getParameters();
    const parameter = atOrThrow(parameters, 0);
    const typereferences = getTypeReferences(parameter);

    const r01 = validateTypeReferences(sourceFile02, typereferences);

    expect(r01.at(0)).toMatchObject({
      type: 'error',
      filePath: posixJoin(tsconfigDir, filename02),
      lineAndCharacter: { line: 9, character: 1 },
      message: 'not export type-alias: TBodyGreeting',
    });

    expect(r01.at(1)).toMatchObject({
      type: 'error',
      filePath: posixJoin(tsconfigDir, filename02),
      lineAndCharacter: { line: 4, character: 1 },
      message: 'not export interface: IBodyPerson',
    });
  });
});
