import type IImportConfiguration from '#compilers/interfaces/IImportConfiguration';
import mergeImportConfiguration from '#generators/mergeImportConfiguration';

export default function dedupeImportConfiguration(configurations: IImportConfiguration[]): IImportConfiguration[] {
  const record = configurations.reduce<Record<string, IImportConfiguration>>((aggregation, importConfiguration) => {
    const importFile = aggregation[importConfiguration.importFile];
    if (importFile == null) {
      return { ...aggregation, [importConfiguration.importFile]: importConfiguration };
    }

    const merged = mergeImportConfiguration(importFile, importConfiguration);
    return { ...aggregation, [importConfiguration.importFile]: merged };
  }, {});

  return Object.values(record);
}
