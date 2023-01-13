import logger from '#module/logging/logger';
import getHandlerFile from '#route/getHandlerFile';
import getRoutePath from '#route/getRoutePath';
import type IRouteHandler from '#route/interface/IRouteHandler';
import type TMethodType from '#route/interface/TMethodType';
import * as path from 'path';

const log = logger();

export default async function proceedStage01(
  apiPath: string,
  methods: readonly TMethodType[],
): Promise<IRouteHandler[]> {
  log.debug('path: ', 'api - ', apiPath);

  const routeHandlerFiles = (
    await Promise.all(methods.map((method) => getHandlerFile(path.join(apiPath, method))))
  ).flat();

  const sortedRouteHandlerFiles = routeHandlerFiles.sort();

  const routeHandlerInfos = sortedRouteHandlerFiles.map((routeHandlerFile) => getRoutePath(routeHandlerFile));

  return routeHandlerInfos;
}
