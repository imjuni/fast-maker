import { getPropertySignatures } from '#/compilers/navigate/getPropertySignatures';
import { getRouteNodeOrThrow } from '#/compilers/routes/getRouteNodeOrThrow';
import { CE_REQUEST_KIND } from '#/compilers/type-tools/const-enum/CE_REQUEST_KIND';
import { validatePropertySignature } from '#/compilers/validators/validatePropertySignature';
import { posixJoin } from '#/tools/posixJoin';
import { randomUUID } from 'crypto';
import { atOrThrow } from 'my-easy-fp';
import * as tsm from 'ts-morph';
import { describe, expect, it } from 'vitest';

const tsconfigDir = posixJoin(process.cwd(), 'examples');
const tsconfigPath = posixJoin(tsconfigDir, 'tsconfig.example.json');
const project = new tsm.Project({ tsConfigFilePath: tsconfigPath });
const context: { index: number } = { index: 0 };
const abilityInterfaceSourceCode = `
export interface IAbility {
  name: string;
  description: string;

  /** usage count of one day */
  count: number;
}`.trim();
const importSourceCode = `
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { ITestInfoType01 } from '#/ITestInfo';`;

describe('validatePropertySignature', () => {
  it('type-literal and two property signature but one property signature is invalid', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `${importSourceCode}

export type TBody = {
  name: string;
  age: number;
}

export function handler(req: { Querystring: ITestInfoType01; bod: TBody }) {
  return 'hello';
}`.trim();

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(posixJoin('examples', name), code, { overwrite });

    create(filename01, abilityInterfaceSourceCode, true);
    const sourceFile02 = create(filename02, source02.trim(), true);
    const node = getRouteNodeOrThrow(sourceFile02);
    const parameter = atOrThrow(node.node.getParameters(), 0);
    const propertySignatures = getPropertySignatures(parameter);
    const r01 = validatePropertySignature({ propertySignatures, kind: CE_REQUEST_KIND.PROPERTY_SIGNATURE });

    expect(r01).toMatchObject({
      valid: false,
      fuzzyValid: true,
      match: ['Querystring'],
      fuzzy: [
        {
          target: 'bod',
          origin: 'Body',
          expectName: 'Body',
          score: 0.001,
          percent: 99.9,
          matchCase: false,
        },
      ],
    });
  });

  it('every property signature not matched', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `${importSourceCode}

export type TBody = {
  name: string;
  age: number;
}

export function handler(req: FastifyRequest<ITestInfoType01>) {
  return 'hello';
}`.trim();

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(posixJoin('examples', name), code, { overwrite });

    create(filename01, abilityInterfaceSourceCode, true);
    const sourceFile02 = create(filename02, source02.trim(), true);
    const node = getRouteNodeOrThrow(sourceFile02);
    const parameter = atOrThrow(node.node.getParameters(), 0);
    const propertySignatures = getPropertySignatures(parameter);
    const r01 = validatePropertySignature({ propertySignatures, kind: CE_REQUEST_KIND.FASTIFY_REQUEST });

    expect(r01).toMatchObject({
      valid: false,
      fuzzyValid: false,
      match: [],
      fuzzy: [
        {
          target: 'name',
          origin: 'Headers',
          expectName: 'Headers',
          score: 0.51,
          percent: 49,
          matchCase: false,
        },
      ],
    });
  });

  it('two property signature but one property signature is invalid', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `${importSourceCode}

export type TBody = {
  name: string;
  age: number;
}

export function handler(req: FastifyRequest<{ Querystring: ITestInfoType01; bod: TBody }>) {
  return 'hello';
}`.trim();

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(posixJoin('examples', name), code, { overwrite });

    create(filename01, abilityInterfaceSourceCode, true);
    const sourceFile02 = create(filename02, source02.trim(), true);
    const node = getRouteNodeOrThrow(sourceFile02);
    const parameter = atOrThrow(node.node.getParameters(), 0);
    const propertySignatures = getPropertySignatures(parameter);
    const r01 = validatePropertySignature({ propertySignatures, kind: CE_REQUEST_KIND.FASTIFY_REQUEST });

    expect(r01).toMatchObject({
      valid: false,
      fuzzyValid: true,
      match: ['Querystring'],
      fuzzy: [
        {
          target: 'bod',
          origin: 'Body',
          expectName: 'Body',
          score: 0.001,
          percent: 99.9,
          matchCase: false,
        },
      ],
    });
  });

  it('one, Querystring exactly matched', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `${importSourceCode}

export function handler(req: FastifyRequest<{ Querystring: ITestInfoType01 }>) {
  return 'hello';
}`.trim();

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(posixJoin('examples', name), code, { overwrite });

    create(filename01, abilityInterfaceSourceCode, true);
    const sourceFile02 = create(filename02, source02.trim(), true);
    const node = getRouteNodeOrThrow(sourceFile02);
    const parameter = atOrThrow(node.node.getParameters(), 0);
    const propertySignatures = getPropertySignatures(parameter);
    const r01 = validatePropertySignature({ propertySignatures, kind: CE_REQUEST_KIND.FASTIFY_REQUEST });

    expect(r01).toMatchObject({ valid: true, fuzzyValid: false, match: ['Querystring'], fuzzy: [] });
  });
});
