import { CE_ROUTE_METHOD } from '#/routes/interface/CE_ROUTE_METHOD';

export default function getMethod(method: string): CE_ROUTE_METHOD {
  const toLoweredMethod = method.toLowerCase();

  if (
    toLoweredMethod === CE_ROUTE_METHOD.GET ||
    toLoweredMethod === CE_ROUTE_METHOD.POST ||
    toLoweredMethod === CE_ROUTE_METHOD.PUT ||
    toLoweredMethod === CE_ROUTE_METHOD.DELETE ||
    toLoweredMethod === CE_ROUTE_METHOD.HEAD ||
    toLoweredMethod === CE_ROUTE_METHOD.OPTIONS ||
    toLoweredMethod === CE_ROUTE_METHOD.PATCH ||
    toLoweredMethod === CE_ROUTE_METHOD.ALL
  ) {
    return toLoweredMethod;
  }

  throw new Error(`Invalid method type: ${method}`);
}
