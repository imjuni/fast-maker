import logger from '#module/logging/logger';
import getMethod from '#route/getMethod';
import type IRouteHandler from '#route/interface/IRouteHandler';
import { replaceSepToPosix, startSepAppend, startSepRemove } from 'my-node-fp';
import { isFail } from 'my-only-either';
import * as path from 'path';
import urljoin from 'url-join';

const log = logger();
const routePathMatchReg = /(.*)(\/|)(get|post|put|delete|options|head|patch|all)(\/|)(.+)(\.ts)/;
const routePathElementMatchReg = /(\[|)([-_0-9a-zA-Z]+)(\]|)(\.ts|\.mts|\.cts|)/;

export default function getRoutePath(originFilename: string): IRouteHandler {
  const filename = replaceSepToPosix(originFilename);
  const refinedFilename = startSepRemove(filename, path.posix.sep);
  const filenameRegMatched = refinedFilename.match(routePathMatchReg);

  if (filenameRegMatched == null) {
    throw new Error(`route handler directory cannot match method with filename: ${refinedFilename}`);
  }

  const routePathByDir = filenameRegMatched[5];
  const methodEither = getMethod(filenameRegMatched[3]);

  if (isFail(methodEither)) {
    throw methodEither.fail;
  }

  const paramsAppliedRouteElements = routePathByDir
    .split(path.posix.sep)
    .filter((endpoint) => endpoint !== '')
    .map((endpoint) => {
      const matched = endpoint.match(routePathElementMatchReg);

      if (matched == null) {
        throw new Error(`invalid endpoint: ${refinedFilename} ${endpoint}`);
      }

      const [, startBracket, handlerFilename] = matched;

      if (startBracket !== '[' && handlerFilename === 'index') {
        return undefined;
      }

      if (startBracket !== '[') {
        return handlerFilename;
      }

      return `:${handlerFilename}`;
    })
    .filter((item): item is string => item !== undefined);

  const joined = urljoin(paramsAppliedRouteElements);

  log.debug(' >>> ', joined);

  return { filename, method: methodEither.pass, routePath: startSepAppend(joined, path.posix.sep) };
}
