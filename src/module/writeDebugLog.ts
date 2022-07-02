import spinner from '@cli/spinner';
import IConfig from '@config/interface/IConfig';
import IRouteConfiguration from '@route/interface/IRouteConfiguration';
import consola from 'consola';
import fastSafeStringify from 'fast-safe-stringify';
import fs from 'fs';
import { isError, isFalse, isNotEmpty } from 'my-easy-fp';
import * as tsm from 'ts-morph';

export default async function writeDebugLog(
  option: IConfig,
  routeConfigurations: IRouteConfiguration[],
  log: Record<string, any>,
) {
  try {
    if (isNotEmpty(option.debugLog) && isFalse(option.debugLog) && routeConfigurations.length <= 0) {
      spinner.update('Cannot generate route path!');

      await fs.promises.writeFile(
        'fast-maker.debug.info.log',
        fastSafeStringify(
          log,
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
    consola.debug(err);
  }
}
