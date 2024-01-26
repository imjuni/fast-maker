import { atOrThrow } from 'my-easy-fp';
import type * as tsm from 'ts-morph';

export function getTypeSymbolText(typeNode: tsm.Type, callback?: (declarationNode: tsm.Node) => string): string {
  const symbol = typeNode.getSymbol();
  const aliasSymbol = typeNode.getAliasSymbol();

  if (symbol != null) {
    const declarationNode = atOrThrow(symbol.getDeclarations(), 0);
    return callback == null ? declarationNode.getText() : callback(declarationNode);
  }

  if (aliasSymbol != null) {
    return aliasSymbol.getEscapedName();
  }

  throw new Error(`Cannot acquire text from type node: ${typeNode.getText()}`);
}

/*

node.getType().getSymbol().getDeclarations().at(0).getText()
"{\n  name: string;\n  age: number;\n}"



node.getType().getAliasSymbol().getDeclarations().at(0).getText()
"export type TQuerystring = {\n  name: string;\n  age: number;\n}"


*/
