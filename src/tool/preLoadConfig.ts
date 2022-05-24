import { IFastMakerYargsParameter } from '@cli/IFastMakerYargsParameter';
import { IOption } from '@module/IOption';
import consola from 'consola';
import * as findUp from 'find-up';
import * as fs from 'fs';
import { parse } from 'jsonc-parser';
import minimist from 'minimist';
import { isEmpty, isFalse, isNotEmpty } from 'my-easy-fp';
import { existsSync } from 'my-node-fp';

export default function preLoadConfig() {
  try {
    const argv = minimist([...process.argv.slice(2)]);

    const configFilePath =
      isNotEmpty(argv.config) || isNotEmpty(argv.c) ? findUp.sync([argv.config, argv.c]) : findUp.sync('.fastmakerrc');

    if (isEmpty(configFilePath) || isFalse(existsSync(configFilePath))) {
      return {};
    }

    const configBuf = fs.readFileSync(configFilePath);
    const rawConfig: Partial<IOption> = parse(configBuf.toString());
    const option: Partial<IFastMakerYargsParameter> = {
      p: rawConfig.project,
      project: rawConfig.project,

      v: rawConfig.verbose,
      verbose: rawConfig.verbose,

      d: rawConfig.verbose ?? false,
      debugLog: rawConfig.verbose ?? false,

      h: rawConfig.path?.handler,
      handler: rawConfig.path?.handler,

      o: rawConfig.path?.output ?? rawConfig.path?.handler,
      output: rawConfig.path?.output ?? rawConfig.path?.handler,
    };

    return option;
  } catch (catched) {
    const err = catched instanceof Error ? catched : new Error('unknown error raised');
    consola.error(err);

    return {};
  }
}
