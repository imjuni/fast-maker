import type { IReason } from '#/compilers/interfaces/IReason';
import type { getExportedStatements } from '#/compilers/navigate/getExportedStatements';
import type { Node, SourceFile } from 'ts-morph';

export function validateTypeReferences(
  sourceFile: SourceFile,
  node: Node,
  result: ReturnType<typeof getExportedStatements>,
): IReason[] {
  const notExportClassReasons = result.classes.total
    .filter((classNode) => {
      return (
        result.classes.exported
          .map((exportedClassNode) => exportedClassNode.getText())
          .includes(classNode.getText()) === false
      );
    })
    .map((nonExportNode) => {
      const startPos = nonExportNode.getStart(false);
      const lineAndCharacter = sourceFile.getLineAndColumnAtPos(startPos);

      const reason: IReason = {
        type: 'error',
        filePath: sourceFile.getFilePath().toString(),
        source: sourceFile,
        node,
        lineAndCharacter: { line: lineAndCharacter.line, character: lineAndCharacter.column },
        message: `not export class: ${
          nonExportNode.getType().getSymbol()?.getEscapedName() ?? node.getType().getText()
        }`,
      };

      return reason;
    });

  const notExportInterfaceReasons = result.interfaces.total
    .filter((interfaceNode) => {
      return (
        result.interfaces.exported
          .map((exportedClassNode) => exportedClassNode.getText())
          .includes(interfaceNode.getText()) === false
      );
    })
    .map((nonExportNode) => {
      const startPos = nonExportNode.getStart(false);
      const lineAndCharacter = sourceFile.getLineAndColumnAtPos(startPos);

      const reason: IReason = {
        type: 'error',
        filePath: sourceFile.getFilePath().toString(),
        source: sourceFile,
        node,
        lineAndCharacter: { line: lineAndCharacter.line, character: lineAndCharacter.column },
        message: `not export interface: ${
          nonExportNode.getType().getSymbol()?.getEscapedName() ?? node.getType().getText()
        }`,
      };

      return reason;
    });

  const notExportTypeAliasReasons = result.typeAliases.total
    .filter((typeAliasNode) => {
      return (
        result.typeAliases.exported
          .map((exportedClassNode) => exportedClassNode.getText())
          .includes(typeAliasNode.getText()) === false
      );
    })
    .map((nonExportNode) => {
      const startPos = nonExportNode.getStart(false);
      const lineAndCharacter = sourceFile.getLineAndColumnAtPos(startPos);

      const reason: IReason = {
        type: 'error',
        filePath: sourceFile.getFilePath().toString(),
        source: sourceFile,
        node,
        lineAndCharacter: { line: lineAndCharacter.line, character: lineAndCharacter.column },
        message: `not export type alias: ${
          nonExportNode.getType().getSymbol()?.getEscapedName() ?? node.getType().getText()
        }`,
      };

      return reason;
    });

  return [...notExportClassReasons, ...notExportInterfaceReasons, ...notExportTypeAliasReasons];
}
