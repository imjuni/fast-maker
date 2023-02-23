import logger from '#module/logging/logger';
import evaluateVariablePath from '#route/evaluateVariablePath';
import getMethod from '#route/getMethod';
import type IRouteHandler from '#route/interface/IRouteHandler';
import { atOrThrow } from 'my-easy-fp';
import { replaceSepToPosix, startSepAppend, startSepRemove } from 'my-node-fp';
import { isFail } from 'my-only-either';
import path from 'path';
import urljoin from 'url-join';

const log = logger();

const routePathMatchReg = /(.*)(\/|)(get|post|put|delete|options|head|patch|all)(\/|)(.+)(\.ts)/;

export default async function getRoutePath(originFilename: string): Promise<IRouteHandler> {
  const filename = replaceSepToPosix(originFilename);
  const refinedFilename = startSepRemove(filename, path.posix.sep);
  const filenameRegMatched = refinedFilename.match(routePathMatchReg);

  if (filenameRegMatched == null) {
    throw new Error(`route handler directory cannot match method with filename: ${refinedFilename}`);
  }

  const routePathByDir = `${atOrThrow(filenameRegMatched, 5)}${atOrThrow(filenameRegMatched, 6)}`;
  const methodEither = getMethod(atOrThrow(filenameRegMatched, 3));

  if (isFail(methodEither)) {
    throw methodEither.fail;
  }

  const paramsAppliedRouteElements = (
    await Promise.all(
      routePathByDir
        .split(path.posix.sep)
        .filter((endpoint) => endpoint !== '')
        .map(async (endpoint) => {
          const refined = startSepRemove(endpoint, path.posix.sep);

          if (refined === 'index.ts') {
            return '';
          }

          const basename = path.basename(endpoint, path.extname(endpoint));
          const variablePath = await evaluateVariablePath(basename);
          return variablePath;
        }),
    )
  ).filter((item): item is string => item !== undefined);

  const joined = urljoin(paramsAppliedRouteElements);

  log.debug(' >>> ', joined);

  return { filename, method: methodEither.pass, routePath: startSepAppend(joined, path.posix.sep) };
}
