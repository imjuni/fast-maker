import { CE_ROUTE_INFO_KIND } from '#/routes/const-enum/CE_ROUTE_INFO_KIND';
import { getRouteMap } from '#/routes/extractors/getRouteMap';
import type { IRoutePathSummary } from '#/routes/interfaces/IRoutePathSummary';
import { evaluteRouteVariable } from '#/routes/paths/evaluteRouteVariable';
import { getRouteVariables } from '#/routes/paths/getRouteVariables';
import type { HTTPMethods } from 'fastify';
import { basenames, replaceSepToPosix, startSepAppend } from 'my-node-fp';
import path from 'node:path';
import urljoin from 'url-join';

export async function getRoutePath(filePath: string): Promise<IRoutePathSummary> {
  const urlPath = replaceSepToPosix(filePath);
  const filename = basenames(urlPath, ['.ts', '.mts', '.cts']);
  const dirname = path.dirname(urlPath);

  const map = await getRouteMap(filePath);
  const evaluates = dirname
    .split(path.posix.sep)
    .filter((endpoint) => endpoint !== '')
    .map((endpoint) => getRouteVariables(endpoint).map((variable) => evaluteRouteVariable(variable, map)));

  const joined = urljoin(evaluates.map((evaluate) => evaluate.join('')));

  return {
    kind: CE_ROUTE_INFO_KIND.ROUTE_PATH_SUMMARY,
    filePath,
    map,
    method: filename as HTTPMethods,
    routePath: startSepAppend(joined, path.posix.sep),
  };
}
