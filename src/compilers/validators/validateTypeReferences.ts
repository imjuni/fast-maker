import type { IReason } from '#/compilers/interfaces/IReason';
import { isFalse } from 'my-easy-fp';
import * as tsm from 'ts-morph';

function getReasonNodeName(node: tsm.Node) {
  switch (node.getKind()) {
    case tsm.SyntaxKind.TypeAliasDeclaration:
      return node.asKindOrThrow(tsm.SyntaxKind.TypeAliasDeclaration).getType().getText();
    case tsm.SyntaxKind.ClassDeclaration:
      return node.asKindOrThrow(tsm.SyntaxKind.ClassDeclaration).getType().getText();
    case tsm.SyntaxKind.InterfaceDeclaration:
      return node.asKind(tsm.SyntaxKind.InterfaceDeclaration)?.getType().getText();
    default:
      throw new Error(`unsupported type: ${node.getText()}`);
  }
}

export function validateTypeReferences(sourceFile: tsm.SourceFile, typeReferences: tsm.TypeReferenceNode[]): IReason[] {
  const typeAliases = sourceFile.getTypeAliases();
  const interfaces = sourceFile.getInterfaces();
  const classes = sourceFile.getClasses();

  const names = typeReferences
    .map((typeReference) => typeReference.getTypeName().asKind(tsm.SyntaxKind.Identifier)?.getText())
    .filter((name): name is string => name != null);

  const referencedTypeAliases = typeAliases.filter((typeAliasNode) => names.includes(typeAliasNode.getName()));
  const referencedInterfaces = interfaces.filter((interfaceNode) => names.includes(interfaceNode.getName()));
  const referencedClasses = classes.filter((classNode) => names.includes(classNode.getName() ?? ''));

  const createReason = (node: tsm.Node, fromSourceFile: tsm.SourceFile, kind: 'type-alias' | 'interface' | 'class') => {
    const startPos = node.getStart(false);
    const lineAndCharacter = fromSourceFile.getLineAndColumnAtPos(startPos);
    const name = getReasonNodeName(node) ?? node.getType().getText();
    const reason: IReason = {
      type: 'error',
      filePath: sourceFile.getFilePath().toString(),
      source: sourceFile,
      node,
      lineAndCharacter: { line: lineAndCharacter.line, character: lineAndCharacter.column },
      message: `not export ${kind}: ${name}`,
    };
    return reason;
  };

  const unExportedTypeAliases = referencedTypeAliases
    .filter((referencedTypeAlias) => isFalse(referencedTypeAlias.isExported()))
    .map((typeAliasNode) => {
      const reason = createReason(typeAliasNode, sourceFile, 'type-alias');
      return reason;
    });

  const unExportedInterfaces = referencedInterfaces
    .filter((referencedInterface) => isFalse(referencedInterface.isExported()))
    .map((interfaceNode) => {
      const reason = createReason(interfaceNode, sourceFile, 'interface');
      return reason;
    });
  const unExportedClasses = referencedClasses
    .filter((referencedClass) => isFalse(referencedClass.isExported()))
    .map((classNode) => {
      const reason = createReason(classNode, sourceFile, 'class');
      return reason;
    });

  return [...unExportedTypeAliases, ...unExportedInterfaces, ...unExportedClasses];
}
