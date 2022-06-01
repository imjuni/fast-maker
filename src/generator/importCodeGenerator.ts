import IImportConfiguration from '@compiler/interface/IImportConfiguration';
import getHashedBindingCode from '@generator/getHashedBindingCode';
import { IOption } from '@module/IOption';
import { replaceSepToPosix } from 'my-node-fp';
import * as path from 'path';

interface IImportCodeGeneratorParam {
  option: IOption;
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

export default function importCodeGenerator({ importConfigurations, option }: IImportCodeGeneratorParam) {
  const importCodes = importConfigurations.map((importConfiguration) => {
    const bindingCode = getHashedBindingCode({
      nonNamedBinding: importConfiguration.nonNamedBinding,
      namedBindings: importConfiguration.namedBindings,
    });

    const relativePath = getRelativePath(option.path.output, importConfiguration.importFile, false);
    return `import ${bindingCode} '${relativePath}';`;
  });

  return importCodes;
}
