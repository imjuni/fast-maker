import type { IHandlerStatement } from '#compilers/interfaces/THandlerNode';
import getHandlerWithOption from '#compilers/navigate/getHandlerWithOption';
import getPropertySignatures from '#compilers/navigate/getPropertySignatures';
import getTypeReferences from '#compilers/tools/getTypeReferences';
import validatePropertySignature from '#compilers/validators/validatePropertySignature';
import validateTypeReferences from '#compilers/validators/validateTypeReference';
import type IConfig from '#configs/interfaces/IConfig';
import logger from '#tools/logging/logger';
import posixJoin from '#tools/posixJoin';
import * as env from '#tools/__tests__/env';
import 'jest';
import { replaceSepToPosix } from 'my-node-fp';
import path from 'path';
import * as tsm from 'ts-morph';

const share: { projectPath: string; project: tsm.Project; option: IConfig } = {} as any;
const log = logger();

beforeAll(async () => {
  share.projectPath = path.join(env.examplePath, 'tsconfig.json');

  share.project = new tsm.Project({ tsConfigFilePath: share.projectPath });
  share.option = {
    project: share.projectPath,
    v: false,
    verbose: false,
    debugLog: false,
    p: share.projectPath,
    h: env.handlerPath,
    handler: env.handlerPath,
    o: env.handlerPath,
    output: env.handlerPath,
    useDefaultExport: true,
    routeFunctionName: 'routing',
  };
});

test('validatePropertySignature', async () => {
  // project://example/handlers/get/justice/world.ts
  const routeFilePath = posixJoin(env.handlerPath, 'get', 'justice', 'world.ts');
  const source = share.project.getSourceFileOrThrow(routeFilePath);
  const handlerWithOption = getHandlerWithOption(source);
  const handler = handlerWithOption.find((node) => node.kind === 'handler');

  if (handler == null) {
    throw new Error('invalid handler');
  }

  const functionNode = handler as IHandlerStatement;

  const casted =
    functionNode.node.getKind() === tsm.SyntaxKind.FunctionDeclaration
      ? functionNode.node.asKindOrThrow(tsm.SyntaxKind.FunctionDeclaration)
      : functionNode.node.asKindOrThrow(tsm.SyntaxKind.ArrowFunction);

  const parameters = casted.getParameters();
  const [parameter] = parameters;

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
  const source = share.project.getSourceFileOrThrow(routeFilePath);
  const handlerWithOption = getHandlerWithOption(source);
  const handler = handlerWithOption.find((node) => node.kind === 'handler');

  if (handler == null) {
    throw new Error('invalid handler');
  }

  const functionNode = handler as IHandlerStatement;

  const casted =
    functionNode.node.getKind() === tsm.SyntaxKind.FunctionDeclaration
      ? functionNode.node.asKindOrThrow(tsm.SyntaxKind.FunctionDeclaration)
      : functionNode.node.asKindOrThrow(tsm.SyntaxKind.ArrowFunction);

  const parameters = casted.getParameters();
  const [parameter] = parameters;

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
      total: validationResult.typeAliases.total.map((node) => node.getType()?.getText()),
      exported: validationResult.typeAliases.exported.map((node) => node.getType()?.getText()),
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
