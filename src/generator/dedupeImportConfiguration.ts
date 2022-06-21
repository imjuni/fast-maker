import IImportConfiguration from '@compiler/interface/IImportConfiguration';
import mergeImportConfiguration from '@generator/mergeImportConfiguration';
import { isEmpty, isNotEmpty } from 'my-easy-fp';

export default function dedupeImportConfiguration(configurations: IImportConfiguration[]): IImportConfiguration[] {
  const record = configurations.reduce<Record<string, IImportConfiguration>>((aggregation, importConfiguration) => {
    if (isEmpty(aggregation[importConfiguration.importFile])) {
      return { ...aggregation, [importConfiguration.importFile]: importConfiguration };
    }

    if (isNotEmpty(aggregation[importConfiguration.importFile])) {
      const merged = mergeImportConfiguration(aggregation[importConfiguration.importFile], importConfiguration);
      return { ...aggregation, [importConfiguration.importFile]: merged };
    }

    return aggregation;
  }, {});

  return Object.values(record);
}
