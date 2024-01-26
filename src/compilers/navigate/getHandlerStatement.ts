import { getArrowFunctionWithModifier } from '#/compilers/navigate/getArrowFunctionWithModifier';
import { getFunctionDeclarationWithModifier } from '#/compilers/navigate/getFunctionDeclarationWithModifier';
import { atOrThrow } from 'my-easy-fp';
import type { ExportedDeclarations } from 'ts-morph';
import { SyntaxKind } from 'ts-morph';

export function getHandlerStatement(exportedDeclarations?: ExportedDeclarations[]) {
  if (exportedDeclarations != null) {
    if (exportedDeclarations.some((handlerNode) => handlerNode.getKind() === SyntaxKind.ArrowFunction)) {
      return getArrowFunctionWithModifier(exportedDeclarations);
    }

    if (exportedDeclarations.some((handlerNode) => handlerNode.getKind() === SyntaxKind.VariableDeclaration)) {
      const node = atOrThrow(exportedDeclarations, 0);
      const variableDeclarationNode = node.asKindOrThrow(SyntaxKind.VariableDeclaration);

      const initialiezer = variableDeclarationNode.getInitializerOrThrow();
      const identifier = variableDeclarationNode.getNameNode().asKindOrThrow(SyntaxKind.Identifier);

      return getArrowFunctionWithModifier([identifier, initialiezer]);
    }

    if (exportedDeclarations.some((handlerNode) => handlerNode.getKind() === SyntaxKind.FunctionDeclaration)) {
      return getFunctionDeclarationWithModifier(exportedDeclarations);
    }

    return undefined;
  }

  return undefined;
}
