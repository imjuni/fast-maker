import type { TRouteOption } from '#configs/interfaces/TRouteOption';
import type { TWatchOption } from '#configs/interfaces/TWatchOption';
import getRoutePath from '#routes/getRoutePath';
import { CE_ROUTE_INFO_KIND } from '#routes/interface/CE_ROUTE_INFO_KIND';
import type { TPickRouteInfo } from '#routes/interface/TRouteInfo';

import { startSepRemove } from 'my-node-fp';
import path from 'path';

export default async function summaryRouteHandlerFile(
  filePath: string,
  option: Pick<TRouteOption, 'handler' | 'cwd'> | Pick<TWatchOption, 'handler' | 'cwd'>,
): Promise<TPickRouteInfo<typeof CE_ROUTE_INFO_KIND.ROUTE>> {
  const handlerPath = startSepRemove(filePath.replace(option.handler, ''), path.posix.sep);
  const routePath = await getRoutePath(handlerPath);

  return {
    ...routePath,
    filePath,
    kind: CE_ROUTE_INFO_KIND.ROUTE,
  } satisfies TPickRouteInfo<typeof CE_ROUTE_INFO_KIND.ROUTE>;
}
