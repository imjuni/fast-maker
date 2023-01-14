import getArrowFunctionWithModifier from '#compiler/navigate/getArrowFunctionWithModifier';
import logger from '#module/logging/logger';
import * as env from '#test-tools/env';
import 'jest';
import { atOrThrow } from 'my-easy-fp';
import { replaceSepToPosix } from 'my-node-fp';
import path from 'path';
import * as tsm from 'ts-morph';

const share: { projectPath: string; project: tsm.Project } = {} as any;
const log = logger();

beforeAll(async () => {
  share.projectPath = path.join(env.examplePath, 'tsconfig.json');
  share.project = new tsm.Project({ tsConfigFilePath: share.projectPath });
});

describe('getArrowFunctionModifier', () => {
  test('anonymous function async', async () => {
    const sourceFileContent = `import { RouteShorthandOptions } from 'fastify';
    import TAbnormalPresident from '../../interface/TPresident';
    import schema from '../get/interface/JSC_IReqPokeHello';
    
    export const option: RouteShorthandOptions = {
      schema: {
        querystring: schema.properties?.Querystring,
        body: schema.properties?.Body,
      },
    };
    
    export default async (req: TAbnormalPresident) => {
      console.debug(req.query);
      console.debug(req.body);
    
      return 'world';
    };`;
    const sourcePath = replaceSepToPosix(path.join(env.examplePath, 'handlers\\delete\\world.ts'));
    const source = share.project.createSourceFile(sourcePath, sourceFileContent, { overwrite: true });

    const declarationMap = source.getExportedDeclarations();
    const declarations = declarationMap.get('default') ?? [];
    const handlerStatement = getArrowFunctionWithModifier(declarations);

    if (handlerStatement == null) {
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

  test('anonymous function sync', async () => {
    const sourceFileContent = `import { RouteShorthandOptions } from 'fastify';
    import TAbnormalPresident from '../../interface/TPresident';
    import schema from '../get/interface/JSC_IReqPokeHello';
    
    export const option: RouteShorthandOptions = {
      schema: {
        querystring: schema.properties?.Querystring,
        body: schema.properties?.Body,
      },
    };
    
    export default (req: TAbnormalPresident) => {
      console.debug(req.query);
      console.debug(req.body);
    
      return 'world';
    };`;
    const sourcePath = replaceSepToPosix(path.join(env.examplePath, 'handlers\\delete\\world.ts'));
    const source = share.project.createSourceFile(sourcePath, sourceFileContent, { overwrite: true });

    const declarationMap = source.getExportedDeclarations();
    const declarations = declarationMap.get('default') ?? [];
    const handlerStatement = getArrowFunctionWithModifier(declarations);

    if (handlerStatement == null) {
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

  test('named arrow function async', async () => {
    const sourceFileContent = `import { RouteShorthandOptions } from 'fastify';
    import TAbnormalPresident from '../../interface/TPresident';
    import schema from '../get/interface/JSC_IReqPokeHello';
    
    export const option: RouteShorthandOptions = {
      schema: {
        querystring: schema.properties?.Querystring,
        body: schema.properties?.Body,
      },
    };
    
    const worldHandler = async (req: TAbnormalPresident) => {
      console.debug(req.query);
      console.debug(req.body);
    
      return 'world';
    };
    
    export default worldHandler;`;

    const sourcePath = replaceSepToPosix(path.join(env.examplePath, 'handlers\\delete\\world2.ts'));
    const source = share.project.createSourceFile(sourcePath, sourceFileContent, { overwrite: true });

    const declarationMap = source.getExportedDeclarations();
    const declarations = declarationMap.get('default') ?? [];
    const variableDeclarationNode = atOrThrow(declarations, 0).asKindOrThrow(tsm.SyntaxKind.VariableDeclaration);

    const initialiezer = variableDeclarationNode.getInitializerOrThrow();
    const identifier = variableDeclarationNode.getNameNode().asKindOrThrow(tsm.SyntaxKind.Identifier);
    const handlerStatement = getArrowFunctionWithModifier([identifier, initialiezer]);

    if (handlerStatement == null) {
      throw new Error('handler statement empty');
    }

    // eslint-disable-next-line
    const { node: _node, ...processed } = handlerStatement;
    const expectation = {
      kind: 'handler',
      type: 'async',
      name: 'worldHandler',
    };

    log.info(processed);

    expect(processed).toEqual(expectation);
  });

  test('named arrow function sync', async () => {
    const sourceFileContent = `import { RouteShorthandOptions } from 'fastify';
    import TAbnormalPresident from '../../interface/TPresident';
    import schema from '../get/interface/JSC_IReqPokeHello';
    
    export const option: RouteShorthandOptions = {
      schema: {
        querystring: schema.properties?.Querystring,
        body: schema.properties?.Body,
      },
    };
    
    const worldHandler = (req: TAbnormalPresident) => {
      console.debug(req.query);
      console.debug(req.body);
    
      return 'world';
    };
    
    export default worldHandler;`;

    const sourcePath = replaceSepToPosix(path.join(env.examplePath, 'handlers\\delete\\world2.ts'));
    const source = share.project.createSourceFile(sourcePath, sourceFileContent, { overwrite: true });

    const declarationMap = source.getExportedDeclarations();
    const declarations = declarationMap.get('default') ?? [];
    const variableDeclarationNode = atOrThrow(declarations, 0).asKindOrThrow(tsm.SyntaxKind.VariableDeclaration);

    const initialiezer = variableDeclarationNode.getInitializerOrThrow();
    const identifier = variableDeclarationNode.getNameNode().asKindOrThrow(tsm.SyntaxKind.Identifier);
    const handlerStatement = getArrowFunctionWithModifier([identifier, initialiezer]);

    if (handlerStatement == null) {
      throw new Error('handler statement empty');
    }

    // eslint-disable-next-line
    const { node: _node, ...processed } = handlerStatement;
    const expectation = {
      kind: 'handler',
      type: 'sync',
      name: 'worldHandler',
    };

    log.info(processed);

    expect(processed).toEqual(expectation);
  });
});
