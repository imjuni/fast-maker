import consola from 'consola';
import { isEmpty, isFalse, isNotEmpty } from 'my-easy-fp';
import * as tsm from 'ts-morph';
import getNamedBindingName from './getNamedBindingName';

interface IFilterExternalTypeReferenceParam {
  source: tsm.SourceFile;
  typeReferenceNodes: tsm.TypeReferenceNode[];
}

export default function getInternalImportTypeReference({
  source,
  typeReferenceNodes,
}: IFilterExternalTypeReferenceParam) {
  consola.debug('---------------------------------------------------------------------------------------------');
  consola.debug('filterExternalTypeReference');
  consola.debug('---------------------------------------------------------------------------------------------');

  const importDeclarations = source.getImportDeclarations().filter((importDeclaration) => {
    const moduleSourceFile = importDeclaration.getModuleSpecifierSourceFile();

    if (isEmpty(moduleSourceFile)) {
      return false;
    }

    return isFalse(moduleSourceFile.isFromExternalLibrary());
  });

  const exportedNamedBindingBinding = importDeclarations
    .map((importDeclaration) => {
      const importClause = importDeclaration.getImportClauseOrThrow();
      const defaultImport = importClause.getDefaultImport();

      const namedBindings = isNotEmpty(defaultImport)
        ? [defaultImport.getText(), ...getNamedBindingName(importClause.getNamedBindings())]
        : getNamedBindingName(importClause.getNamedBindings());

      return namedBindings;
    })
    .flatMap((namedBinding) => namedBinding);

  const filteredTypeReferenceNodes = typeReferenceNodes.filter((node) =>
    exportedNamedBindingBinding.includes(node.getTypeName().getText()),
  );

  return filteredTypeReferenceNodes;
}
