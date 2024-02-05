import type { TFastifyRouteOption } from '#/compilers/interfaces/TFastifyRouteOption';
import { getArrowFunctionOptionNode } from '#/compilers/navigate/getArrowFunctionOptionNode';
import { getFunctionOptionNode } from '#/compilers/navigate/getFunctionOptionNode';
import { CE_DEFAULT_VALUE } from '#/configs/const-enum/CE_DEFAULT_VALUE';
import { atOrThrow } from 'my-easy-fp';
import * as tsm from 'ts-morph';

export function getRouteOptionVariable(sourceFile: tsm.SourceFile): TFastifyRouteOption | undefined {
  const declarationMap = sourceFile.getExportedDeclarations();
  const declarations = declarationMap.get(CE_DEFAULT_VALUE.OPTION_NAME);

  if (declarations != null) {
    if (declarations.some((handlerNode) => handlerNode.getKind() === tsm.SyntaxKind.VariableDeclaration)) {
      const declaration = atOrThrow(declarations, 0);
      const variableDeclarationNode = declaration.asKindOrThrow(tsm.SyntaxKind.VariableDeclaration);

      const initialiezer = variableDeclarationNode.getInitializerOrThrow();
      const identifier = variableDeclarationNode.getNameNode().asKindOrThrow(tsm.SyntaxKind.Identifier);

      if (initialiezer.getKind() === tsm.SyntaxKind.ObjectLiteralExpression) {
        return {
          kind: 'sync',
          type: 'variable',
          path: sourceFile.getFilePath().toString(),
          node: variableDeclarationNode,
          name: identifier.getText(),
        };
      }

      return getArrowFunctionOptionNode([identifier, initialiezer]);
    }

    if (declarations.some((handlerNode) => handlerNode.getKind() === tsm.SyntaxKind.FunctionDeclaration)) {
      return getFunctionOptionNode(declarations);
    }

    return undefined;
  }

  return undefined;
}
