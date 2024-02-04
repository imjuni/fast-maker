import type * as tsm from 'ts-morph';
import { SyntaxKind } from 'ts-morph';

export function getTypeReferences(parameter: tsm.ParameterDeclaration, dedupe?: boolean) {
  const doDedupe = dedupe ?? true;

  const typeReferenceNodes = parameter
    .forEachDescendantAsArray()
    .filter((node) => {
      return node.getKind() === SyntaxKind.TypeReference;
    })
    .map((node) => node.asKindOrThrow(SyntaxKind.TypeReference));

  if (doDedupe === false) {
    return typeReferenceNodes;
  }

  const typeReferenceRecord = typeReferenceNodes.reduce<Record<string, tsm.TypeReferenceNode>>((aggregated, node) => {
    const type = node.getText();

    if (aggregated[type] == null) {
      return { ...aggregated, [type]: node };
    }

    return aggregated;
  }, {});

  const dedupedTypeReferenceNodes = Object.values(typeReferenceRecord);
  return dedupedTypeReferenceNodes;
}
