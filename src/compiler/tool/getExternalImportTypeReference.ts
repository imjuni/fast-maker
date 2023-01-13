import getNamedBindingName from '#compiler/tool/getNamedBindingName';
import type { SourceFile, TypeReferenceNode } from 'ts-morph';

interface IFilterExternalTypeReferenceParam {
  source: SourceFile;
  typeReferenceNodes: TypeReferenceNode[];
}

export default function getExternalImportTypeReference({
  source,
  typeReferenceNodes,
}: IFilterExternalTypeReferenceParam) {
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

  const filteredTypeReferenceNodes = typeReferenceNodes.filter(
    (node) => exportedNamedBindingBinding.includes(node.getTypeName().getText()) === false,
  );

  return filteredTypeReferenceNodes;
}
