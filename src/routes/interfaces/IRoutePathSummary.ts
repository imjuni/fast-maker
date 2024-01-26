import type { CE_ROUTE_INFO_KIND } from '#/routes/const-enum/CE_ROUTE_INFO_KIND';
import type { HTTPMethods } from 'fastify';

export interface IRoutePathSummary {
  kind: typeof CE_ROUTE_INFO_KIND.ROUTE_PATH_SUMMARY;
  method: HTTPMethods;
  map: Map<string, string>;
  filePath: string;
  routePath: string;
}
