import type { ImportClause } from 'ts-morph';
import { SyntaxKind } from 'ts-morph';

export default function getNamedBindingName(bindings: ReturnType<ImportClause['getNamedBindings']>) {
  if (bindings == null) {
    return [];
  }

  if (bindings.getKind() === SyntaxKind.NamespaceImport) {
    return [];
  }

  const namedImports = bindings.asKindOrThrow(SyntaxKind.NamedImports);
  const names = namedImports.getElements().map((element) => {
    return element.getName();
  });

  return names;
}
