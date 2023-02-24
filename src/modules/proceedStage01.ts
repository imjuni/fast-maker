import getHandlerFile from '#routes/getHandlerFile';
import getRoutePath from '#routes/getRoutePath';
import type IRouteHandler from '#routes/interface/IRouteHandler';
import type TMethodType from '#routes/interface/TMethodType';
import logger from '#tools/logging/logger';
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

  const routeHandlerInfos = await Promise.all(
    sortedRouteHandlerFiles.map(async (routeHandlerFile) => getRoutePath(routeHandlerFile)),
  );

  return routeHandlerInfos;
}
