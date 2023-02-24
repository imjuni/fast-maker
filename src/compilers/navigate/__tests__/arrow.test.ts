import getArrowFunctionWithModifier from '#compilers/navigate/getArrowFunctionWithModifier';
import JestContext from '#tools/__tests__/context';
import * as env from '#tools/__tests__/env';
import 'jest';
import { atOrThrow } from 'my-easy-fp';
import { replaceSepToPosix } from 'my-node-fp';
import path from 'path';
import { Project, SyntaxKind } from 'ts-morph';

const context = new JestContext();

beforeAll(() => {
  context.project = new Project();
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
    const source = context.project.createSourceFile(sourcePath, sourceFileContent, { overwrite: true });

    const declarationMap = source.getExportedDeclarations();
    const declarations = declarationMap.get('default') ?? [];
    const handlerStatement = getArrowFunctionWithModifier(declarations);

    if (handlerStatement == null) throw new Error('dont expect undefined');

    // eslint-disable-next-line
    const { node, ...processed } = handlerStatement;

    const expectation = {
      kind: 'handler',
      type: 'async',
      name: 'anonymous function',
    };

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
    const source = context.project.createSourceFile(sourcePath, sourceFileContent, { overwrite: true });

    const declarationMap = source.getExportedDeclarations();
    const declarations = declarationMap.get('default') ?? [];
    const handlerStatement = getArrowFunctionWithModifier(declarations);

    if (handlerStatement == null) throw new Error('dont expect undefined');

    const { node, ...processed } = handlerStatement;
    const expectation = {
      kind: 'handler',
      type: 'sync',
      name: 'anonymous function',
    };

    console.log(processed);

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
    const source = context.project.createSourceFile(sourcePath, sourceFileContent, { overwrite: true });

    const declarationMap = source.getExportedDeclarations();
    const declarations = declarationMap.get('default') ?? [];
    const variableDeclarationNode = atOrThrow(declarations, 0).asKindOrThrow(SyntaxKind.VariableDeclaration);

    const initialiezer = variableDeclarationNode.getInitializerOrThrow();
    const identifier = variableDeclarationNode.getNameNode().asKindOrThrow(SyntaxKind.Identifier);
    const handlerStatement = getArrowFunctionWithModifier([identifier, initialiezer]);

    if (handlerStatement == null) throw new Error('dont expect undefined');

    const { node, ...processed } = handlerStatement;
    const expectation = {
      kind: 'handler',
      type: 'async',
      name: 'worldHandler',
    };

    console.log(processed);

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
    const source = context.project.createSourceFile(sourcePath, sourceFileContent, { overwrite: true });

    const declarationMap = source.getExportedDeclarations();
    const declarations = declarationMap.get('default') ?? [];
    const variableDeclarationNode = atOrThrow(declarations, 0).asKindOrThrow(SyntaxKind.VariableDeclaration);

    const initialiezer = variableDeclarationNode.getInitializerOrThrow();
    const identifier = variableDeclarationNode.getNameNode().asKindOrThrow(SyntaxKind.Identifier);
    const handlerStatement = getArrowFunctionWithModifier([identifier, initialiezer]);

    if (handlerStatement == null) throw new Error('dont expect undefined');

    const { node, ...processed } = handlerStatement;
    const expectation = {
      kind: 'handler',
      type: 'sync',
      name: 'worldHandler',
    };

    console.log(processed);

    expect(processed).toEqual(expectation);
  });
});
