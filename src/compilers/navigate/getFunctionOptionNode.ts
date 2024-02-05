import type { TFastifyRouteOption } from '#/compilers/interfaces/TFastifyRouteOption';
import { findOrThrow } from 'my-easy-fp';
import * as tsm from 'ts-morph';

export function getFunctionOptionNode(nodes: tsm.ExportedDeclarations[]): TFastifyRouteOption | undefined {
  const functionDeclarationNode = findOrThrow(
    nodes,
    (node) => node.getKind() === tsm.SyntaxKind.FunctionDeclaration,
  ).asKindOrThrow(tsm.SyntaxKind.FunctionDeclaration);

  const identifierNode = functionDeclarationNode.getNameNodeOrThrow();

  return {
    path: functionDeclarationNode.getSourceFile().getFilePath().toString(),
    kind: functionDeclarationNode.isAsync() ? 'async' : 'sync',
    type: 'function',
    node: functionDeclarationNode,
    name: identifierNode.getText(),
  };
}
