import IGetModuleInImports from '@compiler/interface/IGetModuleInImports';
import consola from 'consola';
import { isEmpty } from 'my-easy-fp';
import * as tsm from 'ts-morph';

interface IReplaceTypeReferenceInTypeLiteralParam {
  resolutions: IGetModuleInImports[];
  typeReferenceNodes: tsm.TypeReferenceNode[];
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

      if (isEmpty(moduleNames) || moduleNames.length <= 0) {
        return false;
      }

      return moduleNames.includes(typeReferenceNode.getText());
    });

  consola.debug('목표는: ', resolutionWithTypeReferenceNodePairs.length);

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
