import type { TRouteOption } from '#configs/interfaces/TRouteOption';
import type { TWatchOption } from '#configs/interfaces/TWatchOption';
import summaryRouteHandlerFile from '#modules/summaryRouteHandlerFile';
import { CE_ROUTE_INFO_KIND } from '#routes/interface/CE_ROUTE_INFO_KIND';
import type { CE_ROUTE_METHOD } from '#routes/interface/CE_ROUTE_METHOD';
import type { TPickRouteInfo } from '#routes/interface/TRouteInfo';

export default async function summaryRouteHandlerFiles(
  filePaths: string[],
  option: Pick<TRouteOption, 'handler' | 'cwd'> | Pick<TWatchOption, 'handler' | 'cwd'>,
): Promise<TPickRouteInfo<typeof CE_ROUTE_INFO_KIND.SUMMARY_ROUTE_HANDLER_FILE>> {
  const routeHandlers = await Promise.all(filePaths.map((filePath) => summaryRouteHandlerFile(filePath, option)));

  const handlerMap = routeHandlers.reduce<Record<CE_ROUTE_METHOD, TPickRouteInfo<typeof CE_ROUTE_INFO_KIND.ROUTE>[]>>(
    (aggregation, routeHandler) => {
      return { ...aggregation, [routeHandler.method]: [...aggregation[routeHandler.method], routeHandler] };
    },
    {
      get: [],
      post: [],
      put: [],
      delete: [],
      patch: [],
      options: [],
      head: [],
      all: [],
    },
  );

  return { kind: CE_ROUTE_INFO_KIND.SUMMARY_ROUTE_HANDLER_FILE, summary: handlerMap };
}
