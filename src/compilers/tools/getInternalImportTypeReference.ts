import getNamedBindingName from '#/compilers/tools/getNamedBindingName';
import logger from '#/tools/logger';
import type { SourceFile, TypeReferenceNode } from 'ts-morph';

const log = logger();

interface IFilterExternalTypeReferenceParam {
  source: SourceFile;
  typeReferenceNodes: TypeReferenceNode[];
}

export default function getInternalImportTypeReference({
  source,
  typeReferenceNodes,
}: IFilterExternalTypeReferenceParam) {
  log.debug('---------------------------------------------------------------------------------------------');
  log.debug('filterExternalTypeReference');
  log.debug('---------------------------------------------------------------------------------------------');

  const importDeclarations = source.getImportDeclarations().filter((importDeclaration) => {
    const moduleSourceFile = importDeclaration.getModuleSpecifierSourceFile();

    if (moduleSourceFile == null) {
      return false;
    }

    return moduleSourceFile.isFromExternalLibrary() === false;
  });

  const exportedNamedBindingBinding = importDeclarations
    .map((importDeclaration) => {
      const importClause = importDeclaration.getImportClauseOrThrow();
      const defaultImport = importClause.getDefaultImport();

      const namedBindings =
        defaultImport != null
          ? [defaultImport.getText(), ...getNamedBindingName(importClause.getNamedBindings())]
          : getNamedBindingName(importClause.getNamedBindings());

      return namedBindings;
    })
    .flat();

  const filteredTypeReferenceNodes = typeReferenceNodes.filter((node) =>
    exportedNamedBindingBinding.includes(node.getTypeName().getText()),
  );

  return filteredTypeReferenceNodes;
}
