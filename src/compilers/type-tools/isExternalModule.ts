import type * as tsm from 'ts-morph';

export function isExternalModule(importDeclaration: tsm.ImportDeclaration): boolean {
  const moduleSpecifierSourceFile = importDeclaration.getModuleSpecifierSourceFile();

  if (moduleSpecifierSourceFile == null) {
    return true;
  }

  return moduleSpecifierSourceFile.isFromExternalLibrary();
}
