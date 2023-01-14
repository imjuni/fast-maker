import type { IHandlerStatement } from '#compiler/interface/THandlerNode';
import getHandlerWithOption from '#compiler/navigate/getHandlerWithOption';
import getPropertySignatures from '#compiler/navigate/getPropertySignatures';
import logger from '#module/logging/logger';
import * as env from '#test-tools/env';
import 'jest';
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

test('getPropertySignatures', async () => {
  // project://example/handlers/get/justice/world.ts
  // project://example/handlers/get/xman/world.ts
  const routeFilePath = replaceSepToPosix(path.join(env.handlerPath, 'get\\justice\\world.ts'));
  // const routeFilePath = replaceSepToPosix(path.join(env.handlerPath, 'get\\xman\\world.ts'));
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
  const names = propertySignatures.map((symbol) => symbol.getEscapedName());

  const expectation = ['Querysting', 'Body', 'Headers'];
  // const expectation = ['query', 'body', 'headers'];

  expect(names).toEqual(expectation);
});
