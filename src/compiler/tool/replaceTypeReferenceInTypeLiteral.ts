import type IGetModuleInImports from '#compiler/interface/IGetModuleInImports';
import logger from '#module/logging/logger';
import type { TypeReferenceNode } from 'ts-morph';

const log = logger();

interface IReplaceTypeReferenceInTypeLiteralParam {
  resolutions: IGetModuleInImports[];
  typeReferenceNodes: TypeReferenceNode[];
}
export default function replaceTypeReferenceInTypeLiteral({
  resolutions,
  typeReferenceNodes,
}: IReplaceTypeReferenceInTypeLiteralParam) {
  const resolutionWithTypeReferenceNodePairs = resolutions
    .map((resolution) => typeReferenceNodes.map((typeReferenceNode) => ({ resolution, typeReferenceNode })))
    .flatMap((resolutionWithTypeReferenceNodePair) => resolutionWithTypeReferenceNodePair)
    .filter((resolutionWithTypeReferenceNodePair) => {
      const { resolution, typeReferenceNode } = resolutionWithTypeReferenceNodePair;

      const moduleNames = resolution.importDeclarations.map(
        (importDeclaration) => importDeclaration.importModuleNameFrom,
      );

      if (moduleNames == null || moduleNames.length <= 0) {
        return false;
      }

      return moduleNames.includes(typeReferenceNode.getText());
    });

  log.debug('Target: ', resolutionWithTypeReferenceNodePairs.length);

  resolutionWithTypeReferenceNodePairs.forEach((resolutionWithTypeReferenceNodePair) => {
    const { resolution, typeReferenceNode } = resolutionWithTypeReferenceNodePair;

    resolution.importDeclarations.forEach((importDeclaration) => {
      if (typeReferenceNode.getTypeName().getText() === importDeclaration.importModuleNameFrom.trim()) {
        typeReferenceNode.replaceWithText(importDeclaration.importModuleNameTo);
      }
    });

    return true;
  });
}
