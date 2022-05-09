import { IOption } from '@module/IOption';
import JSC_IOption from '@module/JSC_IOption'; // eslint-disable-line
import Ajv from 'ajv';
import consola from 'consola';
import fs from 'fs';
import { parse } from 'jsonc-parser';
import { isFalse } from 'my-easy-fp';
import { exists } from 'my-node-fp';
import { fail, pass, PassFailEither } from 'my-only-either';

export default async function getFastMakerConfigFile(configFilePath: string): Promise<PassFailEither<Error, IOption>> {
  const isExistConfigFile = await exists(configFilePath);

  consola.debug('readConfigFile: ', configFilePath, isExistConfigFile);

  if (isFalse(isExistConfigFile)) {
    return fail(new Error(`Cannot found configuration file: ${configFilePath}`));
  }

  const configBuf = await fs.promises.readFile(configFilePath);
  const rawConfig: Partial<IOption> = parse(configBuf.toString());

  const ajv = new Ajv();
  const validate = ajv.compile(JSC_IOption);
  const validationResult = validate(rawConfig);

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

  return pass(rawConfig as IOption);
}
