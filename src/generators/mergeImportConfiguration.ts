import type { IImportConfiguration } from '#/compilers/interfaces/IImportConfiguration';
import consola from 'consola';
import type { LastArrayElement } from 'type-fest';

export function mergeImportConfiguration(
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
      Record<string, LastArrayElement<IImportConfiguration['namedBindings']>>
    >((aggregation, binding) => {
      if (aggregation[binding.alias] != null) {
        return aggregation;
      }

      return { ...aggregation, [binding.alias]: binding };
    }, {}),
  );

  return next;
}
