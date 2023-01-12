import type { IHandlerStatement } from '#compiler/interface/THandlerNode';
import { isEmpty } from 'my-easy-fp';
import * as tsm from 'ts-morph';

/**
 * Arrow function에서 identifier 노드를 얻어낸다. identifier 노드를 얻어서 추후 route.ts 파일을 생성할 때
 * identifier 노드에서 name 필드를 얻어서 fastify handler에 전달하는 역할을 한다.
 */
export default function getArrowFunctionWithModifier(nodes: tsm.ExportedDeclarations[]): IHandlerStatement | undefined {
  // nodes 길이가 1 이상이고, identifier 노드가 있으면 이름이 있는 arrowFunction 이다
  if (nodes.length <= 1) {
    const [node] = nodes;
    const arrowFunctionNode = node.asKindOrThrow(tsm.SyntaxKind.ArrowFunction);

    return { kind: 'handler', type: arrowFunctionNode.isAsync() ? 'async' : 'sync', node, name: 'anonymous function' };
  }

  const identifierNode = nodes
    .find((node) => node.getKind() === tsm.SyntaxKind.Identifier)
    ?.asKindOrThrow(tsm.SyntaxKind.Identifier);

  const arrowFunctionNode = nodes
    .find((node) => node.getKind() === tsm.SyntaxKind.ArrowFunction)
    ?.asKindOrThrow(tsm.SyntaxKind.ArrowFunction);

  if (isEmpty(arrowFunctionNode) || isEmpty(identifierNode)) {
    return undefined;
  }

  return {
    kind: 'handler',
    type: arrowFunctionNode.isAsync() ? 'async' : 'sync',
    node: arrowFunctionNode,
    name: identifierNode.getText(),
  };
}
