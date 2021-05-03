import { exists } from '@modules/exists';
import { IOption } from '@modules/IOption';
import JSC_IOption from '@modules/JSC_IOption'; // eslint-disable-line
import ll from '@modules/ll';
import Ajv from 'ajv';
import fs from 'fs';
import json5 from 'json5';
import { isEmpty, isFalse } from 'my-easy-fp';

const log = ll(__filename);

export default async function readConfigFile(configFilePath: string): Promise<IOption | undefined> {
  log('readConfigFile: ', configFilePath, await exists(configFilePath));

  if (isFalse(await exists(configFilePath))) {
    return undefined;
  }

  const configBuf = await fs.promises.readFile(configFilePath);
  const rawConfig: Partial<IOption> = json5.parse(configBuf.toString());
  const rawPath = rawConfig.path;

  if (isEmpty(rawPath) || isEmpty(rawPath?.api) || isEmpty(rawPath?.output) || isEmpty(rawPath?.tsconfig)) {
    throw new Error('Invalid directory configuration');
  }

  const optionFromConfigFile: IOption = {
    ...rawConfig,
    path: rawPath,
  };

  const ajv = new Ajv();
  const validate = ajv.compile(JSC_IOption);

  if (isFalse(validate(optionFromConfigFile))) {
    throw new Error(
      `invalid configuration: ${ajv.errors
        ?.map((error) => `${error.data} - ${error.instancePath} - ${error.message}`)
        .join('\n')}`,
    );
  }

  return optionFromConfigFile;
}
