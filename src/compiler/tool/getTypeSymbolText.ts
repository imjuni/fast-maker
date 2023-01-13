import type { Node, Type } from 'ts-morph';

export default function getTypeSymbolText(
  typeNode: Type,
  declarationNodeCallback?: (declarationNode: Node) => string,
): string {
  const symbol = typeNode.getSymbol();
  const aliasSymbol = typeNode.getAliasSymbol();

  if (symbol != null) {
    const [declarationNode] = symbol.getDeclarations();
    return declarationNodeCallback == null ? declarationNode.getText() : declarationNodeCallback(declarationNode);
  }

  if (aliasSymbol != null) {
    return aliasSymbol.getEscapedName();
  }

  throw new Error(`Cannot acquire text from type node: ${typeNode.getText()}`);
}
