import type IImportConfiguration from '#/compilers/interfaces/IImportConfiguration';
import type { TRouteOption } from '#/configs/interfaces/TRouteOption';
import type { TWatchOption } from '#/configs/interfaces/TWatchOption';
import getHashedBindingCode from '#/generators/getHashedBindingCode';
import { replaceSepToPosix } from 'my-node-fp';
import path from 'path';

interface IImportCodeGeneratorParam {
  option: Pick<TRouteOption, 'output'> | Pick<TWatchOption, 'output'>;
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
      nonNamedBindingIsPureType: importConfiguration.nonNamedBindingIsPureType,
      namedBindings: importConfiguration.namedBindings,
    });

    const relativePath = getRelativePath(option.output, importConfiguration.importFile, false);
    return `import ${bindingCode} '${relativePath}';`;
  });

  return importCodes;
}
