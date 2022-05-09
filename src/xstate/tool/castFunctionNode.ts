import type { IHandlerStatement } from '@compiler/interface/THandlerNode';
import * as tsm from 'ts-morph';

export default function castFunctionNode(handlerStatement: IHandlerStatement) {
  if (handlerStatement.node.getKind() === tsm.SyntaxKind.ArrowFunction) {
    return handlerStatement.node.asKindOrThrow(tsm.SyntaxKind.ArrowFunction);
  }

  return handlerStatement.node.asKindOrThrow(tsm.SyntaxKind.FunctionDeclaration);
}
