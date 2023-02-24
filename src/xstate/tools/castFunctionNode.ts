import type { IHandlerStatement } from '#compilers/interfaces/THandlerNode';
import * as tsm from 'ts-morph';

export default function castFunctionNode(handlerStatement: IHandlerStatement) {
  if (handlerStatement.node.getKind() === tsm.SyntaxKind.ArrowFunction) {
    return handlerStatement.node.asKindOrThrow(tsm.SyntaxKind.ArrowFunction);
  }

  return handlerStatement.node.asKindOrThrow(tsm.SyntaxKind.FunctionDeclaration);
}
