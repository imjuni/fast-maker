import IConfig from '#config/interface/IConfig';
import logger from '#tool/logger';
import * as findUp from 'find-up';
import * as fs from 'fs';
import { parse } from 'jsonc-parser';
import { isEmpty, isError, isFalse, isNotEmpty } from 'my-easy-fp';
import { existsSync } from 'my-node-fp';
import yargs from 'yargs';

const log = logger();

export default function preLoadConfig() {
  try {
    const argv = yargs(process.argv.slice(2)).parseSync() as any;

    const configFilePath =
      isNotEmpty(argv.config) || isNotEmpty(argv.c) ? findUp.sync([argv.config, argv.c]) : findUp.sync('.fastmakerrc');

    if (isEmpty(configFilePath) || isFalse(existsSync(configFilePath))) {
      return {};
    }

    const configBuf = fs.readFileSync(configFilePath);
    const rawConfig: Partial<IConfig> = parse(configBuf.toString());
    const config: Partial<IConfig> = {
      c: configFilePath,
      config: configFilePath,

      debugLog: argv.debugLog ?? rawConfig.debugLog ?? false,

      h: argv.h ?? argv.handler ?? rawConfig.h ?? rawConfig.handler,
      handler: argv.h ?? argv.handler ?? rawConfig.h ?? rawConfig.handler,

      o: argv.o ?? argv.output ?? rawConfig.o ?? rawConfig.output ?? rawConfig.handler,
      output: argv.o ?? argv.output ?? rawConfig.o ?? rawConfig.output ?? rawConfig.handler,

      p: argv.p ?? argv.project ?? rawConfig.p ?? rawConfig.project,
      project: argv.p ?? argv.project ?? rawConfig.p ?? rawConfig.project,

      v: argv.v ?? argv.verbose ?? rawConfig.v ?? rawConfig.verbose,
      verbose: argv.v ?? argv.verbose ?? rawConfig.v ?? rawConfig.verbose,

      useDefaultExport: argv.useDefaultExport ?? rawConfig.useDefaultExport,

      routeFunctionName: argv.routeFunctionName ?? rawConfig.routeFunctionName,
    };

    return config;
  } catch (catched) {
    const err = isError(catched) ?? new Error('unknown error raised');
    log.error(err);

    return {};
  }
}
