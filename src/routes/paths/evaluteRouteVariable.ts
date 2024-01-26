import { CE_ROUTE_PATH_KIND } from '#/routes/const-enum/CE_ROUTE_PATH_KIND';
import type { IRouteVariable } from '#/routes/interfaces/IRouteVariable';

export function evaluteRouteVariable(variable: IRouteVariable, replaceMap: Map<string, string>) {
  switch (variable.kind) {
    case CE_ROUTE_PATH_KIND.NULLABLE_VARIABLE:
      return `:${variable.variable}?`;
    case CE_ROUTE_PATH_KIND.WILDCARD_VARIABLE:
      return '*';
    case CE_ROUTE_PATH_KIND.VARIABLE:
      return `:${variable.variable}`;
    case CE_ROUTE_PATH_KIND.CONSTANT:
      return variable.variable;
    case CE_ROUTE_PATH_KIND.REPLACE:
      return replaceMap.get(variable.variable) ?? variable.variable;
    default:
      return '';
  }
}
