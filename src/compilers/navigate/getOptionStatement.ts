import type { IOptionStatement } from '#/compilers/interfaces/THandlerNode';
import type { ExportedDeclarations } from 'ts-morph';
import { SyntaxKind } from 'ts-morph';

export default function getOptionStatement(exportedDeclarations?: ExportedDeclarations[]) {
  const node = exportedDeclarations?.find(
    (exportedDeclaration) => exportedDeclaration.getKind() === SyntaxKind.VariableDeclaration,
  );

  if (node == null) {
    return undefined;
  }

  const statement: IOptionStatement = { kind: 'option', node };
  return statement;
}
