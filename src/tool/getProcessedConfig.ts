import extractor from '@cli/extractor';
import { IFastMakerYargsParameter } from '@cli/IFastMakerYargsParameter';
import { IOption } from '@module/IOption';
import JSC_IOption from '@module/JSC_IOption'; // eslint-disable-line
import Ajv from 'ajv';
import consola from 'consola';
import { isFalse, isNotEmpty } from 'my-easy-fp';
import { exists } from 'my-node-fp';
import { fail, pass, PassFailEither } from 'my-only-either';
import { Arguments } from 'yargs';

interface IProcessConfigParam {
  args: Arguments<IFastMakerYargsParameter>;
  project: string;
}

export default async function getProcessedConfig({
  args,
  project,
}: IProcessConfigParam): Promise<PassFailEither<Error, IOption>> {
  try {
    const configFilePath = args.config;
    const ajv = new Ajv();
    const validate = ajv.compile(JSC_IOption);
    const optionFromCliParameter = extractor(args);

    if (isNotEmpty(configFilePath) && isFalse(await exists(configFilePath))) {
      const validationResult = validate(optionFromCliParameter);

      if (isFalse(validationResult)) {
        consola.debug('Validation fail');

        return fail(
          new Error(
            `invalid configuration: ${ajv.errors
              ?.map((error) => `${error.data} - ${error.instancePath} - ${error.message}`)
              .join('\n')}`,
          ),
        );
      }

      return pass(optionFromCliParameter as IOption);
    }

    const option = { ...optionFromCliParameter, project };

    return pass(option);
  } catch (catched) {
    const err = catched instanceof Error ? catched : new Error('unknown error raised');
    consola.error(err);

    return fail(err);
  }
}
