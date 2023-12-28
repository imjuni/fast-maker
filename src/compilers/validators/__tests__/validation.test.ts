import getHandlerWithOption from '#/compilers/navigate/getHandlerWithOption';
import getPropertySignatures from '#/compilers/navigate/getPropertySignatures';
import getTypeReferences from '#/compilers/tools/getTypeReferences';
import validatePropertySignature from '#/compilers/validators/validatePropertySignature';
import validateTypeReferences from '#/compilers/validators/validateTypeReference';
import JestContext from '#/tools/__tests__/tools/context';
import * as env from '#/tools/__tests__/tools/env';
import loadSourceData from '#/tools/__tests__/tools/loadSourceData';
import * as fc from '#/tools/fuzzyWithCase';
import logger from '#/tools/logger';
import { getExpectValue } from '@maeum/test-utility';
import 'jest';
import * as ef from 'my-easy-fp';
import { replaceSepToPosix } from 'my-node-fp';
import path from 'path';
import * as tsm from 'ts-morph';

const context = new JestContext();
const log = logger();
const { atOrThrow } = ef;

beforeAll(async () => {
  context.projectPath = path.join(env.examplePath, 'tsconfig.json');
  context.project = new tsm.Project({ tsConfigFilePath: context.projectPath });
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('validatePropertySignature', () => {
  test('pass - error typo', async () => {
    const sourceCode = `import { FastifyRequest } from 'fastify';
import { IAbility } from '../../../../../interface/IAbility';

export class SampleC { name: string };

export type TSample = { age: number };

export interface ISample { job: string };
    
export default async function hero(req: FastifyRequest<{ Bod: IAbility; Querystrin: SampleC; Params: TSample; Headers: ISample }>) {
  return req.body;
}`;

    context.project.createSourceFile('c1.ts', sourceCode, { overwrite: true });

    const sourceFile = context.project.getSourceFileOrThrow('c1.ts');
    const handler = getHandlerWithOption(sourceFile).handler!;
    const casted = handler.node.asKindOrThrow(tsm.SyntaxKind.FunctionDeclaration);
    const parameter = atOrThrow(casted.getParameters(), 0);

    const propertySignatures = getPropertySignatures({ parameter });

    const r1 = validatePropertySignature({ propertySignatures, type: 'FastifyRequest' });

    const r2 = getExpectValue(r1, (_, value: any) => {
      if (value === '[Circular]') return undefined;
      if (value instanceof tsm.Node) return undefined;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value;
    });

    const expectation = await loadSourceData<any>('default', __dirname, 'expects', 'expect.out.01');

    expect(r2).toMatchObject(expectation);
  });

  test('pass - class, type, interface', async () => {
    const sourceCode = `import { FastifyRequest } from 'fastify';
import { IAbility } from '../../../../../interface/IAbility';

export class SampleC { name: string };

export type TSample = { age: number };

export interface ISample { job: string };
    
export default async function hero(req: FastifyRequest<{ Body: IAbility; Querystring: SampleC; Params: TSample; Headers: ISample }>) {
  return req.body;
}`;

    context.project.createSourceFile('c1.ts', sourceCode, { overwrite: true });

    const sourceFile = context.project.getSourceFileOrThrow('c1.ts');
    const handler = getHandlerWithOption(sourceFile).handler!;
    const casted = handler.node.asKindOrThrow(tsm.SyntaxKind.FunctionDeclaration);
    const parameter = atOrThrow(casted.getParameters(), 0);

    const propertySignatures = getPropertySignatures({ parameter });

    const r1 = validatePropertySignature({ propertySignatures, type: 'ObjectType' });

    const r2 = getExpectValue(r1, (_, value: any) => {
      if (value === '[Circular]') return undefined;
      if (value instanceof tsm.Node) return undefined;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value;
    });

    expect(r2).toMatchObject({
      valid: true,
      fuzzyValid: false,
      match: ['Body', 'Querystring', 'Params', 'Headers'],
      fuzzy: [],
    });
  });

  test('pass - error type undefined', async () => {
    const sourceCode = `import { FastifyRequest } from 'fastify';
import { IAbility } from '../../../../../interface/IAbility';

export class SampleC { name: string };

export type TSample = { age: number };

export interface ISample { job: string };
    
export default async function hero(req: { Body: IAbility; Querystring: SampleC; Para: TSample; Headers: ISample }) {
  return req.body;
}`;

    context.project.createSourceFile('c1.ts', sourceCode, { overwrite: true });

    const sourceFile = context.project.getSourceFileOrThrow('c1.ts');
    const handler = getHandlerWithOption(sourceFile).handler!;
    const casted = handler.node.asKindOrThrow(tsm.SyntaxKind.FunctionDeclaration);
    const parameter = atOrThrow(casted.getParameters(), 0);
    const propertySignatures = getPropertySignatures({ parameter });

    const spy = jest.spyOn(fc, 'default').mockImplementationOnce(() => []);

    const r1 = validatePropertySignature({ propertySignatures, type: 'ObjectType' });

    spy.mockRestore();

    const r2 = getExpectValue(r1, (_, value: any) => {
      if (value === '[Circular]') return undefined;
      if (value instanceof tsm.Node) return undefined;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value;
    });

    expect(r2).toMatchObject({
      valid: false,
      fuzzyValid: true,
      match: ['Body', 'Querystring', 'Headers'],
      fuzzy: [],
    });
  });
});

describe('validateTypeReferences', () => {
  test('pass', async () => {
    // project://example/handlers/post/dc/world.ts
    const routeFilePath = replaceSepToPosix(path.join(env.handlerPath, 'post\\dc\\world.ts'));
    const source = context.project.getSourceFileOrThrow(routeFilePath);
    const handler = getHandlerWithOption(source);
    const functionNode = handler.handler!;

    const casted =
      functionNode.node.getKind() === tsm.SyntaxKind.FunctionDeclaration
        ? functionNode.node.asKindOrThrow(tsm.SyntaxKind.FunctionDeclaration)
        : functionNode.node.asKindOrThrow(tsm.SyntaxKind.ArrowFunction);

    const parameter = atOrThrow(casted.getParameters(), 0);

    const typeReferenceNodes = getTypeReferences(parameter);
    const validationResult = validateTypeReferences({ source, typeReferenceNodes });

    const expectation = {
      valid: false,
      typeAliases: {
        total: ['QuerystringAndBody'],
        exported: [],
      },
      interfaces: {
        total: [],
        exported: [],
      },
      classes: {
        total: [],
        exported: [],
      },
    };

    const extract = {
      valid: validationResult.valid,
      typeAliases: {
        total: validationResult.typeAliases.total.map((node) => node.getType().getText()),
        exported: validationResult.typeAliases.exported.map((node) => node.getType().getText()),
      },
      interfaces: {
        total: validationResult.interfaces.total.map((node) => node.getText()),
        exported: validationResult.interfaces.exported.map((node) => node.getText()),
      },
      classes: {
        total: validationResult.classes.total.map((node) => node.getText()),
        exported: validationResult.classes.exported.map((node) => node.getText()),
      },
    };

    log.debug(extract);

    expect(extract).toEqual(expectation);
  });

  test('pass - class, type, interface', async () => {
    const sourceCode = `import { FastifyRequest } from 'fastify';
import { IAbility } from '../../../../../interface/IAbility';

export class SampleC { name: string };

export type TSample = { age: number };

export interface ISample { job: string };
    
export default async function hero(req: FastifyRequest<{ Body: IAbility; Querystring: SampleC; Params: TSample; Headers: ISample }>) {
  return req.body;
}`;

    context.project.createSourceFile('c1.ts', sourceCode, { overwrite: true });

    const sourceFile = context.project.getSourceFileOrThrow('c1.ts');
    const handler = getHandlerWithOption(sourceFile).handler!;
    const casted = handler.node.asKindOrThrow(tsm.SyntaxKind.FunctionDeclaration);
    const parameter = atOrThrow(casted.getParameters(), 0);

    const typeReferenceNodes = getTypeReferences(parameter);
    const r1 = validateTypeReferences({ source: sourceFile, typeReferenceNodes });

    const r2 = getExpectValue(r1, (_, value: any) => {
      if (value === '[Circular]') return undefined;
      if (value instanceof tsm.Node) return undefined;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value;
    });

    const expectation = await loadSourceData<any>('default', __dirname, 'expects', 'expect.out.02');
    expect(r2).toMatchObject(expectation);
  });
});
