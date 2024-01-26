import { CE_ROUTE_METHOD } from '#/routes/const-enum/CE_ROUTE_METHOD';

export function isValidMethod(method: string): method is CE_ROUTE_METHOD {
  const toLoweredMethod = method.toLowerCase();

  switch (toLoweredMethod) {
    case CE_ROUTE_METHOD.DELETE:
    case CE_ROUTE_METHOD.GET:
    case CE_ROUTE_METHOD.HEAD:
    case CE_ROUTE_METHOD.PATCH:
    case CE_ROUTE_METHOD.POST:
    case CE_ROUTE_METHOD.PUT:
    case CE_ROUTE_METHOD.OPTIONS:
    case CE_ROUTE_METHOD.PROPFIND:
    case CE_ROUTE_METHOD.PROPPATCH:
    case CE_ROUTE_METHOD.MKCOL:
    case CE_ROUTE_METHOD.COPY:
    case CE_ROUTE_METHOD.MOVE:
    case CE_ROUTE_METHOD.LOCK:
    case CE_ROUTE_METHOD.UNLOCK:
    case CE_ROUTE_METHOD.TRACE:
    case CE_ROUTE_METHOD.SEARCH:
      return true;
    default:
      return false;
  }
}
