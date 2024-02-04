import { getArrowFunctionHandlerNode } from '#/compilers/navigate/getArrowFunctionHandlerNode';
import { posixJoin } from '#/tools/posixJoin';
import { atOrThrow } from 'my-easy-fp';
import path from 'path';
import * as tsm from 'ts-morph';
import { describe, expect, it } from 'vitest';

const tsconfigDir = path.join(process.cwd(), 'examples');
const tsconfigPath = path.join(tsconfigDir, 'tsconfig.example.json');
const project = new tsm.Project({ tsConfigFilePath: tsconfigPath });
// const context: { index: number } = { index: 0 };

describe('getArrowFunctionModifier', () => {
  it('anonymous async function', async () => {
    const sourceFileContent = `import { RouteShorthandOptions } from 'fastify';
    import TAbnormalPresident from '../../interface/TPresident';
    import schema from '../get/interface/JSC_IReqPokeHello';
    
    export const option: RouteShorthandOptions = {
      schema: {
        querystring: schema.properties?.Querystring,
        body: schema.properties?.Body,
      },
    };
    
    export const handler =  async (req: TAbnormalPresident) => {
      console.debug(req.query);
      console.debug(req.body);
    
      return 'world';
    };`;
    const sourcePath = posixJoin(tsconfigDir, 'handlers', 'world', 'delete.ts');
    const source = project.createSourceFile(sourcePath, sourceFileContent, { overwrite: true });

    const declarationMap = source.getExportedDeclarations();
    const declarations = declarationMap.get('handler') ?? [];
    const declaration = atOrThrow(declarations, 0);
    const variableDeclarationNode = declaration.asKindOrThrow(tsm.SyntaxKind.VariableDeclaration);
    const initialiezer = variableDeclarationNode.getInitializerOrThrow();
    const identifier = variableDeclarationNode.getNameNode().asKindOrThrow(tsm.SyntaxKind.Identifier);
    const handlerNode = getArrowFunctionHandlerNode([initialiezer, identifier]);

    expect(handlerNode).toMatchObject({
      path: posixJoin(tsconfigDir, 'handlers', 'world', 'delete.ts'),
      kind: 'async',
      type: 'arrow',
      name: 'handler',
    });
  });

  it('anonymous sync function', async () => {
    const sourceFileContent = `import { RouteShorthandOptions } from 'fastify';
    import TAbnormalPresident from '../../interface/TPresident';
    import schema from '../get/interface/JSC_IReqPokeHello';
    
    export const option: RouteShorthandOptions = {
      schema: {
        querystring: schema.properties?.Querystring,
        body: schema.properties?.Body,
      },
    };
    
    export const handler = (req: TAbnormalPresident) => {
      console.debug(req.query);
      console.debug(req.body);
    
      return 'world';
    };`;

    const sourcePath = posixJoin(tsconfigDir, 'handlers', 'world', 'delete.ts');
    const source = project.createSourceFile(sourcePath, sourceFileContent, { overwrite: true });

    const declarationMap = source.getExportedDeclarations();
    const declarations = declarationMap.get('handler') ?? [];
    const declaration = atOrThrow(declarations, 0);
    const variableDeclarationNode = declaration.asKindOrThrow(tsm.SyntaxKind.VariableDeclaration);
    const initialiezer = variableDeclarationNode.getInitializerOrThrow();
    const identifier = variableDeclarationNode.getNameNode().asKindOrThrow(tsm.SyntaxKind.Identifier);
    const handlerNode = getArrowFunctionHandlerNode([initialiezer, identifier]);

    expect(handlerNode).toMatchObject({
      path: posixJoin(tsconfigDir, 'handlers', 'world', 'delete.ts'),
      kind: 'sync',
      type: 'arrow',
      name: 'handler',
    });
  });

  it('exist handler function, but not arrow function', async () => {
    const sourceFileContent = `import { RouteShorthandOptions } from 'fastify';
    import TAbnormalPresident from '../../interface/TPresident';
    import schema from '../get/interface/JSC_IReqPokeHello';
    
    export const option: RouteShorthandOptions = {
      schema: {
        querystring: schema.properties?.Querystring,
        body: schema.properties?.Body,
      },
    };
    
    export const handler = 'hello'`;

    const sourcePath = posixJoin(tsconfigDir, 'handlers', 'world', 'delete.ts');
    const source = project.createSourceFile(sourcePath, sourceFileContent, { overwrite: true });

    const declarationMap = source.getExportedDeclarations();
    const declarations = declarationMap.get('handler') ?? [];
    const declaration = atOrThrow(declarations, 0);
    const variableDeclarationNode = declaration.asKindOrThrow(tsm.SyntaxKind.VariableDeclaration);
    const initialiezer = variableDeclarationNode.getInitializerOrThrow();
    const identifier = variableDeclarationNode.getNameNode().asKindOrThrow(tsm.SyntaxKind.Identifier);
    const handlerNode = getArrowFunctionHandlerNode([initialiezer, identifier]);

    expect(handlerNode).toBeUndefined();
  });
});
