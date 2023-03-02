import type { CE_ROUTE_METHOD } from '#routes/interface/CE_ROUTE_METHOD';

export default interface IRouteHandler {
  method: CE_ROUTE_METHOD;
  filePath: string;
  routePath: string;
}
