import { isEmpty } from 'my-easy-fp';
import * as tsm from 'ts-morph';

export default function getNamedBindingName(bindings: ReturnType<tsm.ImportClause['getNamedBindings']>) {
  if (isEmpty(bindings)) {
    return [];
  }

  // namespace import에 대한 내용을 정리해야한다
  if (bindings.getKind() === tsm.SyntaxKind.NamespaceImport) {
    // const namespaceImport = bindings.asKindOrThrow(tsm.SyntaxKind.NamespaceImport);
    return [];
  }

  const namedImports = bindings.asKindOrThrow(tsm.SyntaxKind.NamedImports);
  const names = namedImports.getElements().map((element) => {
    return element.getName();
  });

  return names;
}
