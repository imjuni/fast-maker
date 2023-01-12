import IImportConfiguration from '#compiler/interface/IImportConfiguration';
import consola from 'consola';
import { isNotEmpty, TResolveArray } from 'my-easy-fp';

export default function mergeImportConfiguration(
  source: IImportConfiguration,
  target: IImportConfiguration,
): IImportConfiguration {
  if (source.importFile !== target.importFile) {
    consola.warn(`importFile is different: ${source.importFile} vs ${target.importFile}`);
  }

  const next = { ...source };

  next.nonNamedBinding = source.nonNamedBinding ?? target.nonNamedBinding;
  next.hash = target.hash;
  next.importFile = target.importFile;
  next.namedBindings = Object.values(
    [...source.namedBindings, ...target.namedBindings].reduce<
      Record<string, TResolveArray<IImportConfiguration['namedBindings']>>
    >((aggregation, binding) => {
      if (isNotEmpty(aggregation[binding.alias])) {
        return aggregation;
      }

      return { ...aggregation, [binding.alias]: binding };
    }, {}),
  );

  return next;
}
