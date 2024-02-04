export function removeQuote(literal: string): string {
  try {
    const trimed = literal.trim();
    const firstChar = trimed.substring(0, 1);

    switch (firstChar) {
      case `"`:
        return literal.replace(/(^")(.+)("$)/, '$2');
      case `'`:
        return literal.replace(/(^')(.+)('$)/, '$2');
      default:
        return literal;
    }
  } catch {
    return literal;
  }
}
