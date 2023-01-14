import type IImportConfiguration from '#compiler/interface/IImportConfiguration';
import type IConfig from '#config/interface/IConfig';
import getHashedBindingCode from '#generator/getHashedBindingCode';
import { replaceSepToPosix } from 'my-node-fp';
import path from 'path';

interface IImportCodeGeneratorParam {
  config: IConfig;
  importConfigurations: IImportConfiguration[];
}

function getRelativePath(outputDir: string, importPath: string, ext: boolean) {
  const extProcessedImportPath = ext
    ? importPath
    : path.join(path.dirname(importPath), path.basename(importPath).replace(/(\.ts|\.mts|\.cts)/, ''));

  const relativePath = path.relative(outputDir, extProcessedImportPath);
  const replacedPath = replaceSepToPosix(relativePath);

  if (replacedPath.startsWith('.')) {
    return replacedPath;
  }

  return `.${path.posix.sep}${replacedPath}`;
}

export default function importCodeGenerator({ importConfigurations, config }: IImportCodeGeneratorParam) {
  const importCodes = importConfigurations.map((importConfiguration) => {
    const bindingCode = getHashedBindingCode({
      nonNamedBinding: importConfiguration.nonNamedBinding,
      namedBindings: importConfiguration.namedBindings,
    });

    const relativePath = getRelativePath(config.output, importConfiguration.importFile, false);
    return `import ${bindingCode} '${relativePath}';`;
  });

  return importCodes;
}
