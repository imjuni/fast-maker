import type { CE_ROUTE_PATH_KIND } from '#/routes/const-enum/CE_ROUTE_PATH_KIND';

export interface IRouteVariable {
  matched: string;
  kind: CE_ROUTE_PATH_KIND;
  nullable: boolean;
  variable: string;
}
