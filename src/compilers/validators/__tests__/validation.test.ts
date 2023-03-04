import getHandlerWithOption from '#compilers/navigate/getHandlerWithOption';
import getPropertySignatures from '#compilers/navigate/getPropertySignatures';
import getTypeReferences from '#compilers/tools/getTypeReferences';
import validatePropertySignature from '#compilers/validators/validatePropertySignature';
import validateTypeReferences from '#compilers/validators/validateTypeReference';
import logger from '#tools/logger';
import posixJoin from '#tools/posixJoin';
import JestContext from '#tools/__tests__/tools/context';
import * as env from '#tools/__tests__/tools/env';
import 'jest';
import { atOrThrow } from 'my-easy-fp';
import { replaceSepToPosix } from 'my-node-fp';
import path from 'path';
import * as tsm from 'ts-morph';

const context = new JestContext();

const log = logger();

beforeAll(async () => {
  context.projectPath = path.join(env.examplePath, 'tsconfig.json');
  context.project = new tsm.Project({ tsConfigFilePath: context.projectPath });
});

test('validatePropertySignature', async () => {
  // project://example/handlers/get/justice/world.ts
  const routeFilePath = posixJoin(env.handlerPath, 'get', 'justice', 'world.ts');
  const source = context.project.getSourceFileOrThrow(routeFilePath);
  const handler = getHandlerWithOption(source);
  const functionNode = handler.handler!;

  const casted =
    functionNode.node.getKind() === tsm.SyntaxKind.FunctionDeclaration
      ? functionNode.node.asKindOrThrow(tsm.SyntaxKind.FunctionDeclaration)
      : functionNode.node.asKindOrThrow(tsm.SyntaxKind.ArrowFunction);

  const parameter = atOrThrow(casted.getParameters(), 0);

  const propertySignatures = getPropertySignatures({ parameter });
  const validationResult = validatePropertySignature({ propertySignatures, type: 'FastifyRequest' });

  const expectation = {
    valid: false,
    fuzzyValid: true,
    match: ['Body', 'Headers'],
    fuzzy: [
      {
        target: 'Querysting',
        origin: 'Querystring',
        expectName: 'Querystring',
        score: 0.1,
        percent: 90,
        matchCase: false,
      },
    ],
  };

  log.debug(validationResult);

  expect(validationResult).toEqual(expectation);
});

test('validateTypeReferences', async () => {
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
