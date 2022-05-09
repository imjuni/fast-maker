import { exists } from 'my-node-fp';
import { IOption } from '@module/IOption';
import mergewith from 'lodash.mergewith';
import { isEmpty, isFalse } from 'my-easy-fp';

// import ll from '@modules/ll';
// const log = ll(__filename);

export default async function merge(
  optionFromConfigFile: IOption | undefined,
  optionFromCliParam: Partial<IOption>,
  project: string,
): Promise<IOption> {
  const pathFromOptionFromConfigFile = optionFromConfigFile?.path;
  const pathFromOptionFromCliParam = optionFromCliParam?.path;

  const mergedPath: Partial<IOption['path']> = mergewith<Partial<IOption['path']>, Partial<IOption['path']>>(
    pathFromOptionFromConfigFile ?? {},
    pathFromOptionFromCliParam ?? {},
    (left, right) => {
      if (isEmpty(right)) {
        return left;
      }

      return right;
    },
  );

  if (isEmpty(mergedPath.handler) || isEmpty(mergedPath.output)) {
    throw new Error('Missed parameter API handler directory, tsconfig.json, output directory');
  }

  if (isFalse(await exists(mergedPath.handler))) {
    throw new Error(`invalid api path not exists: ${mergedPath.handler}`);
  }

  if (isFalse(await exists(mergedPath.output))) {
    throw new Error(`invalid output path not exists: ${mergedPath.output}`);
  }

  const concretePath: IOption['path'] = {
    handler: mergedPath.handler,
    output: mergedPath.output,
  };

  const concreteOption: IOption = {
    project,
    ...mergedPath,
    path: concretePath,
  };

  return concreteOption;
}
