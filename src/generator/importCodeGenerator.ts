import IImportConfiguration from '@compiler/interface/IImportConfiguration';
import getHandlerNameWithoutSquareBracket from '@generator/getHandlerNameWithoutSquareBracket';
import { IOption } from '@module/IOption';
import { isNotEmpty } from 'my-easy-fp';
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

function getHashedBindingCode({
  nonNamedBinding,
  namedBindings,
}: {
  nonNamedBinding?: string;
  namedBindings?: IImportConfiguration['namedBindings'];
}): string {
  if (isNotEmpty(nonNamedBinding) && nonNamedBinding !== '' && isNotEmpty(namedBindings) && namedBindings.length > 0) {
    const optionProcessedNamedBindings = namedBindings.map((binding) =>
      binding.name === binding.alias ? binding.name : `${binding.name} as ${binding.alias}`,
    );

    const handlerName = getHandlerNameWithoutSquareBracket(nonNamedBinding);
    return `${handlerName}, { ${optionProcessedNamedBindings.join(', ')} } from`;
  }

  if (isNotEmpty(nonNamedBinding) && nonNamedBinding !== '') {
    const handlerName = getHandlerNameWithoutSquareBracket(nonNamedBinding);
    return `${handlerName} from`;
  }

  if (isNotEmpty(namedBindings) && namedBindings.length > 0) {
    const optionProcessedNamedBindings = namedBindings.map((binding) =>
      binding.name === binding.alias ? binding.name : `${binding.name} as ${binding.alias}`,
    );

    return `{ ${optionProcessedNamedBindings.join(', ')} } from`;
  }

  return '';
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
