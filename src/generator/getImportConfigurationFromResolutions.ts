import type IGetModuleInImports from '#compiler/interface/IGetModuleInImports';
import type IImportConfiguration from '#compiler/interface/IImportConfiguration';
import type { SourceFile } from 'ts-morph';

export default function getImportConfigurationFromResolutions({
  source,
  resolutions,
}: {
  source: SourceFile;
  resolutions: IGetModuleInImports[];
}): IImportConfiguration[] {
  const importConfigurations = resolutions.map((resolution) => {
    const defaultImportDeclarations = resolution.importDeclarations.find(
      (importDeclaration) => importDeclaration.isDefaultExport,
    );

    const importConfiguration: IImportConfiguration = {
      hash: resolution.hash,
      namedBindings: resolution.importDeclarations
        .filter((importDeclaration) => importDeclaration.isDefaultExport === false)
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
