import { CE_DEFAULT_VALUE } from '#/configs/const-enum/CE_DEFAULT_VALUE';
import type { TRouteOption } from '#/configs/interfaces/TRouteOption';
import type { TWatchOption } from '#/configs/interfaces/TWatchOption';
import { getConfigFilePath } from '#/configs/interfaces/getConfigFilePath';
import consola from 'consola';
import * as findUp from 'find-up';
import * as fs from 'fs';
import { parse } from 'jsonc-parser';
import minimist from 'minimist';

export function preLoadConfig() {
  try {
    const argv = minimist(process.argv.slice(2));

    const tsconfigPath =
      argv.project != null || argv.p != null
        ? findUp.sync([argv.project, argv.p])
        : findUp.sync(CE_DEFAULT_VALUE.TSCONFIG_FILE_NAME);

    const configFilePath = getConfigFilePath(argv, tsconfigPath);
    const config =
      configFilePath != null
        ? (parse(fs.readFileSync(configFilePath).toString()) as TRouteOption | TWatchOption)
        : { project: undefined };

    return {
      ...config,
      p: config.project ?? tsconfigPath,
      project: config.project ?? tsconfigPath,
      c: configFilePath,
      config: configFilePath,
    };
  } catch (caught) {
    const err = caught instanceof Error ? caught : new Error('unknown error raised');

    consola.error(err);
    consola.error(err.stack);

    return {};
  }
}
