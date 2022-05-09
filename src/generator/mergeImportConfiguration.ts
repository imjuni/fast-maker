import IImportConfiguration from '@compiler/interface/IImportConfiguration';
import consola from 'consola';
import { isNotEmpty } from 'my-easy-fp';

export default function mergeImportConfiguration(
  source: IImportConfiguration,
  target: IImportConfiguration,
): IImportConfiguration {
  if (isNotEmpty(source.nonNamedBinding) && source.nonNamedBinding !== target.nonNamedBinding) {
    consola.warn(`default export name is different: ${source.nonNamedBinding} vs ${target.nonNamedBinding}`);
  }

  if (source.importFile !== target.importFile) {
    consola.warn(`importFile is different: ${source.importFile} vs ${target.importFile}`);
  }

  const next = { ...source };

  next.nonNamedBinding = target.nonNamedBinding;
  next.hash = target.hash;
  next.importFile = target.importFile;
  next.namedBindings = Array.from(new Set([...source.namedBindings, ...target.namedBindings]));

  return next;
}
