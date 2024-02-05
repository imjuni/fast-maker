import type { TFastifyRouteHandler } from '#/compilers/interfaces/TFastifyRouteHandler';
import { getArrowFunctionHandlerNode } from '#/compilers/navigate/getArrowFunctionHandlerNode';
import { getFunctionHandlerNode } from '#/compilers/navigate/getFunctionHandlerNode';
import { CE_DEFAULT_VALUE } from '#/configs/const-enum/CE_DEFAULT_VALUE';
import { atOrThrow } from 'my-easy-fp';
import * as tsm from 'ts-morph';

export function getRouteFunction(sourceFile: tsm.SourceFile): TFastifyRouteHandler | undefined {
  const declarationMap = sourceFile.getExportedDeclarations();
  const declarations = declarationMap.get(CE_DEFAULT_VALUE.HANDLER_NAME);

  if (declarations != null) {
    if (declarations.some((handlerNode) => handlerNode.getKind() === tsm.SyntaxKind.VariableDeclaration)) {
      const declaration = atOrThrow(declarations, 0);
      const variableDeclarationNode = declaration.asKindOrThrow(tsm.SyntaxKind.VariableDeclaration);

      const initialiezer = variableDeclarationNode.getInitializerOrThrow();
      const identifier = variableDeclarationNode.getNameNode().asKindOrThrow(tsm.SyntaxKind.Identifier);

      return getArrowFunctionHandlerNode([identifier, initialiezer]);
    }

    if (declarations.some((handlerNode) => handlerNode.getKind() === tsm.SyntaxKind.FunctionDeclaration)) {
      return getFunctionHandlerNode(declarations);
    }

    return undefined;
  }

  return undefined;
}
