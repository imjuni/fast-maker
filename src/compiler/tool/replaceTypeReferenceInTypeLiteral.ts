import type { IGetResolvedModuleInImportsReturn } from '@compiler/tool/getResolvedModuleInImports';
import consola from 'consola';
import { isEmpty } from 'my-easy-fp';
import * as tsm from 'ts-morph';

interface IReplaceTypeReferenceInTypeLiteralParam {
  resolutions: IGetResolvedModuleInImportsReturn[];
  typeReferenceNodes: tsm.TypeReferenceNode[];
}
export default function replaceTypeReferenceInTypeLiteral({
  resolutions,
  typeReferenceNodes,
}: IReplaceTypeReferenceInTypeLiteralParam) {
  const filteredResolutions = resolutions.filter((resolution) => {
    return resolution.importDeclarations.some((importDeclaration) => importDeclaration.isDefaultExport);
  });

  const resolutionWithTypeReferenceNodePairs = filteredResolutions
    .map((resolution) => typeReferenceNodes.map((typeReferenceNode) => ({ resolution, typeReferenceNode })))
    .flatMap((resolutionWithTypeReferenceNodePair) => resolutionWithTypeReferenceNodePair);

  consola.debug('목표는: ', resolutionWithTypeReferenceNodePairs.length);

  resolutionWithTypeReferenceNodePairs
    .filter((resolutionWithTypeReferenceNodePair) => {
      const { resolution, typeReferenceNode } = resolutionWithTypeReferenceNodePair;

      const defaultImportDeclaration = resolution.importDeclarations.find(
        (importDeclaration) => importDeclaration.isDefaultExport,
      );

      if (isEmpty(defaultImportDeclaration)) {
        return false;
      }

      return defaultImportDeclaration.importModuleNameFrom === typeReferenceNode.getText();
    })
    .forEach((resolutionWithTypeReferenceNodePair) => {
      const { resolution, typeReferenceNode } = resolutionWithTypeReferenceNodePair;

      const defaultImportDeclaration = resolution.importDeclarations.find(
        (importDeclaration) => importDeclaration.isDefaultExport,
      );

      if (isEmpty(defaultImportDeclaration)) {
        return false;
      }

      if (typeReferenceNode.getTypeName().getText() === defaultImportDeclaration.importModuleNameFrom.trim()) {
        typeReferenceNode.replaceWithText(defaultImportDeclaration.importModuleNameTo);
      }

      return true;
    });
}
