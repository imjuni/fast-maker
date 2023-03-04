import type IGetModuleInImports from '#compilers/interfaces/IGetModuleInImports';
import logger from '#tools/logger';
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
    .flat()
    .filter((resolutionWithTypeReferenceNodePair) => {
      const { resolution, typeReferenceNode } = resolutionWithTypeReferenceNodePair;

      const moduleNames = resolution.importDeclarations.map(
        (importDeclaration) => importDeclaration.importModuleNameFrom,
      );

      if (moduleNames.length <= 0) {
        return false;
      }

      return moduleNames.includes(typeReferenceNode.getText());
    });

  log.debug(`Target: ${resolutionWithTypeReferenceNodePairs.length}`);

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
