import type { IImportConfiguration } from '#/compilers/interfaces/IImportConfiguration';
import type { IResolvedImportModule } from '#/compilers/interfaces/IResolvedImportModule';

export function getImportConfigurationFromResolutions(resolutions: IResolvedImportModule[]): IImportConfiguration[] {
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
          isPureType: importDeclaration.isPureType,
        })),
      nonNamedBinding: defaultImportDeclarations?.importModuleNameTo,
      nonNamedBindingIsPureType: defaultImportDeclarations?.isPureType,
      importFile: resolution.exportFrom,
      relativePath: resolution.relativePath,
    };

    return importConfiguration;
  });

  return importConfigurations;
}
