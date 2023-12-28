import evaluateVariablePath from '#/routes/evaluateVariablePath';
import getMethod from '#/routes/getMethod';
import { CE_ROUTE_INFO_KIND } from '#/routes/interface/CE_ROUTE_INFO_KIND';
import type { TPickRouteInfo } from '#/routes/interface/TRouteInfo';
import logger from '#/tools/logger';
import { atOrThrow } from 'my-easy-fp';
import { replaceSepToPosix, startSepAppend, startSepRemove } from 'my-node-fp';
import path from 'path';
import urljoin from 'url-join';

const log = logger();

const routePathMatchReg = /(.*)(\/|)(get|post|put|delete|options|head|patch|all)(\/|)(.+)(\.ts)/;

export default async function getRoutePath(filePath: string): Promise<TPickRouteInfo<typeof CE_ROUTE_INFO_KIND.ROUTE>> {
  const filename = replaceSepToPosix(filePath);
  const refinedFilename = startSepRemove(filename, path.posix.sep);
  const filenameRegMatched = refinedFilename.match(routePathMatchReg);

  if (filenameRegMatched == null) {
    throw new Error(`route handler directory cannot match method with filename: ${refinedFilename}`);
  }

  const routePathByDir = `${atOrThrow(filenameRegMatched, 5)}${atOrThrow(filenameRegMatched, 6)}`;
  const method = getMethod(atOrThrow(filenameRegMatched, 3));

  const paramsAppliedRouteElements = await Promise.all(
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
  );

  const joined = urljoin(paramsAppliedRouteElements);

  log.trace(`>>> ${filePath}  <> ${joined}`);

  return {
    kind: CE_ROUTE_INFO_KIND.ROUTE,
    filePath: filename,
    method,
    routePath: startSepAppend(joined, path.posix.sep),
  };
}
