import IImportConfiguration from '#compiler/interface/IImportConfiguration';
import getHandlerNameWithoutSquareBracket from '#generator/getHandlerNameWithoutSquareBracket';
import { isNotEmpty } from 'my-easy-fp';

export default function getHashedBindingCode({
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
