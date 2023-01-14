import type IGetModuleInImports from '#compiler/interface/IGetModuleInImports';
import type IImportConfiguration from '#compiler/interface/IImportConfiguration';

export default function getImportConfigurationFromResolutions({
  resolutions,
}: {
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
      // source,
    };

    return importConfiguration;
  });

  return importConfigurations;
}
