import { IHandlerStatement } from '#compiler/interface/THandlerNode';
import getArrowFunctionWithModifier from '#compiler/navigate/getArrowFunctionWithModifier';
import getFunctionDeclarationWithModifier from '#compiler/navigate/getFunctionDeclarationWithModifier';
import getHandlerWithOption from '#compiler/navigate/getHandlerWithOption';
import getPropertySignatures from '#compiler/navigate/getPropertySignatures';
import * as env from '#test-tools/env';
import logger from '#tool/logger';
import 'jest';
import { isEmpty } from 'my-easy-fp';
import { replaceSepToPosix } from 'my-node-fp';
import path from 'path';
import * as tsm from 'ts-morph';

const share: { projectPath: string; project: tsm.Project } = {} as any;
const log = logger();

beforeAll(async () => {
  share.projectPath = path.join(env.examplePath, 'tsconfig.json');
  share.project = new tsm.Project({ tsConfigFilePath: share.projectPath });
});

test('getHandlerWithOption', async () => {
  const handlerFileInfos = [
    replaceSepToPosix(path.join(env.examplePath, 'handlers\\get\\justice\\[dc-league]\\hello.ts')),
    replaceSepToPosix(path.join(env.examplePath, 'handlers\\delete\\world.ts')),
  ].map((sourcePath) => {
    const source = share.project.getSourceFileOrThrow(sourcePath);
    const handlerFileInfo = getHandlerWithOption(source);

    return handlerFileInfo;
  });

  log.info(handlerFileInfos);

  const expectation = [
    [
      { kind: 'option' },
      {
        kind: 'handler',
        type: 'async',
        name: 'hello',
      },
    ],
    [
      { kind: 'option' },
      {
        kind: 'handler',
        type: 'async',
        name: 'anonymous function',
      },
    ],
  ];

  expect(handlerFileInfos).toMatchObject(expectation);
});

test('getArrowFunctionModifier', async () => {
  const sourcePath = replaceSepToPosix(path.join(env.examplePath, 'handlers\\delete\\world.ts'));
  const source = share.project.getSourceFileOrThrow(sourcePath);

  const declarationMap = source.getExportedDeclarations();
  const declarations = declarationMap.get('default') ?? [];
  const handlerStatement = getArrowFunctionWithModifier(declarations);

  if (isEmpty(handlerStatement)) {
    throw new Error('handler statement empty');
  }

  // eslint-disable-next-line
  const { node: _node, ...processed } = handlerStatement;
  const expectation = {
    kind: 'handler',
    type: 'async',
    name: 'anonymous function',
  };

  log.info(processed);

  expect(processed).toEqual(expectation);
});

test('getFunctionDeclarationWithModifier', async () => {
  const sourcePath = replaceSepToPosix(path.join(env.examplePath, 'handlers\\get\\xman\\fastify.ts'));
  const source = share.project.getSourceFileOrThrow(sourcePath);

  const declarationMap = source.getExportedDeclarations();
  const declarations = declarationMap.get('default') ?? [];
  const handlerStatement = getFunctionDeclarationWithModifier(declarations);

  if (isEmpty(handlerStatement)) {
    throw new Error('handler statement empty');
  }

  // eslint-disable-next-line
  const { node: _node, ...processed } = handlerStatement;
  const expectation = {
    kind: 'handler',
    type: 'sync',
    name: 'anonymous function',
  };

  log.info(processed);

  expect(processed).toEqual(expectation);
});

test('getPropertySignatures', async () => {
  // project://example/handlers/get/justice/world.ts
  // project://example/handlers/get/xman/world.ts
  const routeFilePath = replaceSepToPosix(path.join(env.handlerPath, 'get\\justice\\world.ts'));
  // const routeFilePath = replaceSepToPosix(path.join(env.handlerPath, 'get\\xman\\world.ts'));
  const source = share.project.getSourceFileOrThrow(routeFilePath);
  const handlerWithOption = getHandlerWithOption(source);
  const handler = handlerWithOption.find((node) => node.kind === 'handler');

  if (isEmpty(handler)) {
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
  const names = propertySignatures.map((symbol) => symbol.getEscapedName());

  const expectation = ['Querysting', 'Body', 'Headers'];
  // const expectation = ['query', 'body', 'headers'];

  expect(names).toEqual(expectation);
});
