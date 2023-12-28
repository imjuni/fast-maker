import type IImportConfiguration from '#/compilers/interfaces/IImportConfiguration';
import type { IHandlerStatement, IOptionStatement } from '#/compilers/interfaces/THandlerNode';
import type { CE_ROUTE_INFO_KIND } from '#/routes/interface/CE_ROUTE_INFO_KIND';
import type { CE_ROUTE_METHOD } from '#/routes/interface/CE_ROUTE_METHOD';
import type IRouteConfiguration from '#/routes/interface/IRouteConfiguration';

interface IRouteHandler {
  kind: typeof CE_ROUTE_INFO_KIND.ROUTE;
  method: CE_ROUTE_METHOD;
  filePath: string;
  routePath: string;
}

interface IRouteHandlerFileSummary {
  kind: typeof CE_ROUTE_INFO_KIND.SUMMARY_ROUTE_HANDLER_FILE;
  summary: Record<CE_ROUTE_METHOD, TPickRouteInfo<typeof CE_ROUTE_INFO_KIND.ROUTE>[]>;
}

interface IRouteHandlerFileValidate {
  kind: typeof CE_ROUTE_INFO_KIND.VALIDATE_ROUTE_HANDLER_FILE;
  invalid: IRouteHandler[];
  valid: Record<CE_ROUTE_METHOD, TPickRouteInfo<typeof CE_ROUTE_INFO_KIND.ROUTE>[]>;
}

interface IRouteNullableStatement {
  kind: typeof CE_ROUTE_INFO_KIND.NULLABLE_NODE;
  method: CE_ROUTE_METHOD;
  filePath: string;
  routePath: string;
  option?: IOptionStatement;
  handler?: IHandlerStatement;
}

interface IRouteStatement {
  kind: typeof CE_ROUTE_INFO_KIND.NON_NULLABLE_NODE;
  method: CE_ROUTE_METHOD;
  filePath: string;
  routePath: string;
  option?: IOptionStatement;
  handler: IHandlerStatement;
}

interface IRouteInfo {
  kind: typeof CE_ROUTE_INFO_KIND.ANALYSIS;
  imports: IImportConfiguration[];
  routes: IRouteConfiguration[];
}

type TRouteInfo =
  | IRouteHandler
  | IRouteHandlerFileSummary
  | IRouteHandlerFileValidate
  | IRouteNullableStatement
  | IRouteStatement
  | IRouteInfo;

export type TPickRouteInfo<T extends CE_ROUTE_INFO_KIND> = Extract<TRouteInfo, { kind: T }>;

export default TRouteInfo;
