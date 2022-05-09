import IImportConfiguration from '@compiler/interface/IImportConfiguration';
import * as tsm from 'ts-morph';
import { type IGetResolvedModuleInImportsReturn } from '@compiler/tool/getResolvedModuleInImports';
import { isFalse } from 'my-easy-fp';

export default function getImportConfigurationFromResolutions({
  hash,
  source,
  resolutions,
}: {
  hash: string;
  source: tsm.SourceFile;
  resolutions: IGetResolvedModuleInImportsReturn[];
}): IImportConfiguration[] {
  const importConfigurations = resolutions.map((resolution) => {
    const defaultImportDeclarations = resolution.importDeclarations.find(
      (importDeclaration) => importDeclaration.isDefaultExport,
    );

    const importConfiguration: IImportConfiguration = {
      hash,
      namedBindings: resolution.importDeclarations
        .filter((importDeclaration) => isFalse(importDeclaration.isDefaultExport))
        .map((importDeclaration) => importDeclaration.importModuleNameTo),
      nonNamedBinding: defaultImportDeclarations?.importModuleNameTo,
      importFile: resolution.exportFrom,
      source,
    };

    return importConfiguration;
  });

  return importConfigurations;
}
