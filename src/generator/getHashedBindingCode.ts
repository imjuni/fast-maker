import type IImportConfiguration from '#compiler/interface/IImportConfiguration';
import getHandlerNameWithoutSquareBracket from '#generator/getHandlerNameWithoutSquareBracket';

export default function getHashedBindingCode({
  nonNamedBinding,
  nonNamedBindingIsPureType,
  namedBindings,
}: {
  nonNamedBinding?: string;
  nonNamedBindingIsPureType?: boolean;
  namedBindings?: IImportConfiguration['namedBindings'];
}): string {
  if (nonNamedBinding != null && nonNamedBinding !== '' && namedBindings != null && namedBindings.length > 0) {
    const optionProcessedNamedBindings = namedBindings.map((binding) =>
      binding.name === binding.alias
        ? `${binding.isPureType ? 'type ' : ''}${binding.name}`
        : `${binding.isPureType ? 'type ' : ''}${binding.name} as ${binding.alias}`,
    );

    const handlerName = getHandlerNameWithoutSquareBracket(nonNamedBinding);
    return `${nonNamedBindingIsPureType ?? false ? 'type ' : ''}${handlerName}, { ${optionProcessedNamedBindings.join(
      ', ',
    )} } from`;
  }

  if (nonNamedBinding != null && nonNamedBinding !== '') {
    const handlerName = getHandlerNameWithoutSquareBracket(nonNamedBinding);
    return `${nonNamedBindingIsPureType ?? false ? 'type ' : ''}${handlerName} from`;
  }

  if (namedBindings != null && namedBindings.length > 0) {
    const optionProcessedNamedBindings = namedBindings.map((binding) =>
      binding.name === binding.alias
        ? `${binding.isPureType ? 'type ' : ''}${binding.name}`
        : `${binding.isPureType ? 'type ' : ''}${binding.name} as ${binding.alias}`,
    );

    return `{ ${optionProcessedNamedBindings.join(', ')} } from`;
  }

  return '';
}
