import { exists } from '@modules/exists';
import { IOption } from '@modules/IOption';
import ll from '@modules/ll';
import mergewith from 'lodash.mergewith';
import { isEmpty, isFalse } from 'my-easy-fp';
import { isPlainObject } from 'is-plain-object';

const log = ll(__filename);

export default async function merge(
  optionFromConfigFile: IOption | undefined,
  optionFromCliParameter: Partial<IOption>,
): Promise<IOption> {
  const pathFromOptionFromConfigFile = optionFromConfigFile?.path;
  const pathFromOptionFromCliParameter = optionFromCliParameter?.path;

  const mergedPath: Partial<IOption['path']> = mergewith<Partial<IOption['path']>, Partial<IOption['path']>>(
    pathFromOptionFromConfigFile ?? {},
    pathFromOptionFromCliParameter ?? {},
    (left, right) => {
      if (isEmpty(right)) {
        return left;
      }

      return right;
    },
  );

  if (isEmpty(mergedPath.api) || isEmpty(mergedPath.tsconfig) || isEmpty(mergedPath.output)) {
    throw new Error('Missed parameter API handler directory, tsconfig.json, output directory');
  }

  if (isFalse(await exists(mergedPath.api))) {
    throw new Error(`invalid api path not exists: ${mergedPath.api}`);
  }

  if (isFalse(await exists(mergedPath.tsconfig))) {
    throw new Error(`invalid tsconfig path not exists: ${mergedPath.tsconfig}`);
  }

  if (isFalse(await exists(mergedPath.output))) {
    throw new Error(`invalid output path not exists: ${mergedPath.output}`);
  }

  const concretePath: IOption['path'] = {
    api: mergedPath.api,
    tsconfig: mergedPath.tsconfig,
    output: mergedPath.output,
  };

  const option: Partial<IOption> = mergewith(optionFromConfigFile ?? {}, optionFromCliParameter, (left, right) => {
    if (isEmpty(right)) {
      return left;
    }

    return right;
  });

  const concreteOption: IOption = { ...option, path: concretePath };

  return concreteOption;
}
