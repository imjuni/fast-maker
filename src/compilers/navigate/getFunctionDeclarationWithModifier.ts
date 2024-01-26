import type { IHandlerStatement } from '#/compilers/interfaces/THandlerNode';
import { findOrThrow } from 'my-easy-fp';
import * as tsm from 'ts-morph';

export function getFunctionDeclarationWithModifier(nodes: tsm.ExportedDeclarations[]): IHandlerStatement | undefined {
  const functionDeclarationNode = findOrThrow(
    nodes,
    (node) => node.getKind() === tsm.SyntaxKind.FunctionDeclaration,
  ).asKindOrThrow(tsm.SyntaxKind.FunctionDeclaration);

  const identifierNode = functionDeclarationNode.getNameNode();

  // nodes 길이가 1 이상이고, identifier 노드가 있으면 이름이 있는 function 이다
  if (identifierNode == null) {
    return {
      kind: 'handler',
      type: functionDeclarationNode.isAsync() ? 'async' : 'sync',
      node: functionDeclarationNode,
      name: 'anonymous function',
    };
  }

  return {
    kind: 'handler',
    type: functionDeclarationNode.isAsync() ? 'async' : 'sync',
    node: functionDeclarationNode,
    name: identifierNode.getText(),
  };
}
