import type { TFastifyRouteHandler } from '#/compilers/interfaces/TFastifyRouteHandler';
import { getArrowFunctionHandlerNode } from '#/compilers/routes/getArrowFunctionHandlerNode';
import { getFunctionHandlerNode } from '#/compilers/routes/getFunctionHandlerNode';
import { atOrThrow } from 'my-easy-fp';
import * as tsm from 'ts-morph';

export function getRouteNode(sourceFile: tsm.SourceFile): TFastifyRouteHandler | undefined {
  const declarationMap = sourceFile.getExportedDeclarations();
  const handler = declarationMap.get('handler');

  if (handler != null) {
    if (handler.some((handlerNode) => handlerNode.getKind() === tsm.SyntaxKind.VariableDeclaration)) {
      const node = atOrThrow(handler, 0);
      const variableDeclarationNode = node.asKindOrThrow(tsm.SyntaxKind.VariableDeclaration);

      const initialiezer = variableDeclarationNode.getInitializerOrThrow();
      const identifier = variableDeclarationNode.getNameNode().asKindOrThrow(tsm.SyntaxKind.Identifier);

      return getArrowFunctionHandlerNode([identifier, initialiezer]);
    }

    if (handler.some((handlerNode) => handlerNode.getKind() === tsm.SyntaxKind.FunctionDeclaration)) {
      return getFunctionHandlerNode(handler);
    }

    return undefined;
  }

  return undefined;
}
