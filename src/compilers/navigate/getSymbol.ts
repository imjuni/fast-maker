import type * as tsm from 'ts-morph';

export function getSymbol(type: tsm.Type<tsm.ts.Type>): tsm.Symbol | undefined {
  try {
    const symbol = type.getSymbol();

    if (symbol != null) {
      return symbol;
    }

    const aliasSymbol = type.getAliasSymbolOrThrow();
    return aliasSymbol;
  } catch {
    return undefined;
  }
}
