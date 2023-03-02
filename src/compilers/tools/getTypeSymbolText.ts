import { atOrThrow } from 'my-easy-fp';
import type { Node, Type } from 'ts-morph';

export default function getTypeSymbolText(
  typeNode: Type,
  declarationNodeCallback?: (declarationNode: Node) => string,
): string {
  const symbol = typeNode.getSymbol();
  const aliasSymbol = typeNode.getAliasSymbol();

  if (symbol != null) {
    const declarationNode = atOrThrow(symbol.getDeclarations(), 0);
    return declarationNodeCallback == null ? declarationNode.getText() : declarationNodeCallback(declarationNode);
  }

  if (aliasSymbol != null) {
    return aliasSymbol.getEscapedName();
  }

  throw new Error(`Cannot acquire text from type node: ${typeNode.getText()}`);
}
