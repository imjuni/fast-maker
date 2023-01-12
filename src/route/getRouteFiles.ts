import getHandlerFile from '#route/getHandlerFile';
import getRoutePath from '#route/getRoutePath';
import IRouteHandler from '#route/interface/IRouteHandler';
import methods from '#route/interface/methods';
import consola from 'consola';
import * as path from 'path';

export default async function getRouteFiles(apiPath: string): Promise<IRouteHandler[]> {
  consola.debug('path: ', 'api - ', apiPath);

  const routeHandlerFiles = (
    await Promise.all(methods.map((method) => getHandlerFile(path.join(apiPath, method))))
  ).flatMap((files) => files);

  const sortedRouteHandlerFiles = routeHandlerFiles.sort();

  const routeHandlerInfos = sortedRouteHandlerFiles.map((routeHandlerFile) => getRoutePath(routeHandlerFile));

  return routeHandlerInfos;
}
