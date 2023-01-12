import IGetModuleInImports from '#compiler/interface/IGetModuleInImports';
import IImportConfiguration from '#compiler/interface/IImportConfiguration';
import { isFalse } from 'my-easy-fp';
import * as tsm from 'ts-morph';

export default function getImportConfigurationFromResolutions({
  source,
  resolutions,
}: {
  source: tsm.SourceFile;
  resolutions: IGetModuleInImports[];
}): IImportConfiguration[] {
  const importConfigurations = resolutions.map((resolution) => {
    const defaultImportDeclarations = resolution.importDeclarations.find(
      (importDeclaration) => importDeclaration.isDefaultExport,
    );

    const importConfiguration: IImportConfiguration = {
      hash: resolution.hash,
      namedBindings: resolution.importDeclarations
        .filter((importDeclaration) => isFalse(importDeclaration.isDefaultExport))
        .map((importDeclaration) => ({
          name: importDeclaration.importModuleNameFrom,
          alias: importDeclaration.importModuleNameTo,
        })),
      nonNamedBinding: defaultImportDeclarations?.importModuleNameTo,
      importFile: resolution.exportFrom,
      source,
    };

    return importConfiguration;
  });

  return importConfigurations;
}
