import type { TFastifyRouteOption } from '#/compilers/interfaces/TFastifyRouteOption';
import { findOrThrow } from 'my-easy-fp';
import type { ExportedDeclarations } from 'ts-morph';
import { SyntaxKind } from 'ts-morph';

/**
 * Arrow function에서 identifier 노드를 얻어낸다. identifier 노드를 얻어서 추후 route.ts 파일을 생성할 때
 * identifier 노드에서 name 필드를 얻어서 fastify handler에 전달하는 역할을 한다.
 */
export function getArrowFunctionOptionNode(nodes: ExportedDeclarations[]): TFastifyRouteOption | undefined {
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
    path: arrowFunctionNode.getSourceFile().getFilePath().toString(),
    kind: arrowFunctionNode.isAsync() ? 'async' : 'sync',
    type: 'arrow',
    node: arrowFunctionNode,
    name: identifierNode.getText(),
  };
}
