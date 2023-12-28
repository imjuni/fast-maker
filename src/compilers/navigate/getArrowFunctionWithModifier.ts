import type { IHandlerStatement } from '#/compilers/interfaces/THandlerNode';
import { atOrThrow, findOrThrow } from 'my-easy-fp';
import type { ExportedDeclarations } from 'ts-morph';
import { SyntaxKind } from 'ts-morph';

/**
 * Arrow function에서 identifier 노드를 얻어낸다. identifier 노드를 얻어서 추후 route.ts 파일을 생성할 때
 * identifier 노드에서 name 필드를 얻어서 fastify handler에 전달하는 역할을 한다.
 */
export default function getArrowFunctionWithModifier(nodes: ExportedDeclarations[]): IHandlerStatement | undefined {
  // nodes 길이가 1 이상이고, identifier 노드가 있으면 이름이 있는 arrowFunction 이다
  // nodes array length more than 1 and node have identifier node what is named arrow function
  if (nodes.length <= 1) {
    const node = atOrThrow(nodes, 0);
    const arrowFunctionNode = node.asKindOrThrow(SyntaxKind.ArrowFunction);

    return { kind: 'handler', type: arrowFunctionNode.isAsync() ? 'async' : 'sync', node, name: 'anonymous function' };
  }

  const identifierNode = findOrThrow(nodes, (node) => node.getKind() === SyntaxKind.Identifier).asKindOrThrow(
    SyntaxKind.Identifier,
  );

  const expectArrowNode = nodes.find((node) => node.getKind() === SyntaxKind.ArrowFunction);

  if (expectArrowNode == null) {
    return undefined;
  }

  const arrowFunctionNode = findOrThrow(nodes, (node) => node.getKind() === SyntaxKind.ArrowFunction).asKindOrThrow(
    SyntaxKind.ArrowFunction,
  );

  return {
    kind: 'handler',
    type: arrowFunctionNode.isAsync() ? 'async' : 'sync',
    node: arrowFunctionNode,
    name: identifierNode.getText(),
  };
}
