import { isEmpty, isFalse } from 'my-easy-fp';
import * as tsm from 'ts-morph';

export default function getTypeReferences(parameter: tsm.ParameterDeclaration, dedupe?: boolean) {
  const doDedupe = dedupe ?? true;

  const typeReferenceNodes = parameter
    .forEachDescendantAsArray()
    .filter((node) => {
      return node.getKind() === tsm.SyntaxKind.TypeReference;
    })
    .map((node) => node.asKindOrThrow(tsm.SyntaxKind.TypeReference));

  if (isFalse(doDedupe)) {
    return typeReferenceNodes;
  }

  const typeReferenceRecord = typeReferenceNodes.reduce<Record<string, tsm.TypeReferenceNode>>((aggregated, node) => {
    const type = node.getText();
    return isEmpty(aggregated[type]) ? { ...aggregated, [type]: node } : { ...aggregated };
  }, {});

  const dedupedTypeReferenceNodes = Object.values(typeReferenceRecord);
  return dedupedTypeReferenceNodes;
}
