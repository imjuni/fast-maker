import spinner from '#cli/display/spinner';
import IConfig from '#config/interface/IConfig';
import IRouteConfiguration from '#route/interface/IRouteConfiguration';
import logger from '#tool/logger';
import fastSafeStringify from 'fast-safe-stringify';
import fs from 'fs';
import { isError, isFalse, isNotEmpty } from 'my-easy-fp';
import * as tsm from 'ts-morph';

const log = logger();

export default async function writeDebugLog(
  option: IConfig,
  routeConfigurations: IRouteConfiguration[],
  logContent: Record<string, any>,
) {
  try {
    if (isNotEmpty(option.debugLog) && isFalse(option.debugLog) && routeConfigurations.length <= 0) {
      spinner.update('Cannot generate route path!');

      await fs.promises.writeFile(
        'fast-maker.debug.info.log',
        fastSafeStringify(
          logContent,
          (_key, value) => {
            if (value === '[Circular]') {
              return undefined;
            }

            if (value instanceof tsm.Node) {
              return undefined;
            }

            return value;
          },
          2,
        ),
      );
    }
  } catch (catched) {
    const err = isError(catched) ?? new Error('unknown error raised from writeDebugLog');
    log.debug(err.message, err.stack);
  }
}
