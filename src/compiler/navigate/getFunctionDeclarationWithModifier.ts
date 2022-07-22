import { IHandlerStatement } from '@compiler/interface/THandlerNode';
import { isEmpty } from 'my-easy-fp';
import * as tsm from 'ts-morph';

export default function getFunctionDeclarationWithModifier(
  nodes: tsm.ExportedDeclarations[],
): IHandlerStatement | undefined {
  const functionDeclarationNode = nodes
    .find((node) => node.getKind() === tsm.SyntaxKind.FunctionDeclaration)
    ?.asKindOrThrow(tsm.SyntaxKind.FunctionDeclaration);

  const identifierNode = functionDeclarationNode?.getNameNode();

  if (functionDeclarationNode === undefined || functionDeclarationNode === null) {
    return undefined;
  }

  // nodes 길이가 1 이상이고, identifier 노드가 있으면 이름이 있는 function 이다
  if (identifierNode === undefined || identifierNode === null) {
    return {
      kind: 'handler',
      type: functionDeclarationNode.isAsync() ? 'async' : 'sync',
      node: functionDeclarationNode,
      name: 'anonymous function',
    };
  }

  if (isEmpty(functionDeclarationNode) || isEmpty(identifierNode)) {
    return undefined;
  }

  return {
    kind: 'handler',
    type: functionDeclarationNode.isAsync() ? 'async' : 'sync',
    node: functionDeclarationNode,
    name: identifierNode.getText(),
  };
}
