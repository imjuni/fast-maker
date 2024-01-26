import { CE_ROUTE_PATH_KIND } from '#/routes/const-enum/CE_ROUTE_PATH_KIND';
import type { IRouteVariable } from '#/routes/interfaces/IRouteVariable';

const routeChar = '[-a-zA-Z0-9@:%._+~#=]';
const replaceChar = '[-_a-zA-Z0-9]';

const tokens: [CE_ROUTE_PATH_KIND, boolean, RegExp][] = [
  [CE_ROUTE_PATH_KIND.NULLABLE_VARIABLE, true, new RegExp(`^(\\[\\[)()(${routeChar}+?)(\\]\\])`)],
  [CE_ROUTE_PATH_KIND.WILDCARD_VARIABLE, false, new RegExp(`^(\\[)(\\.\\.\\.)(${routeChar}+?)(\\])`)],
  [CE_ROUTE_PATH_KIND.VARIABLE, false, new RegExp(`^(\\[)()(${routeChar}+?)(\\])`)],
  [CE_ROUTE_PATH_KIND.REPLACE, false, new RegExp(`^(\\[)(\\$)(${replaceChar}+?)(\\])`)],
];

export function extractVariable(routePath: string) {
  return tokens.reduce<IRouteVariable | undefined>((evaluted, token) => {
    if (evaluted != null) {
      return evaluted;
    }

    const [kind, nullable, r] = token;
    const matched = r.exec(routePath);
    const full = matched?.at(0);
    const variable = matched?.at(3);

    if (full != null && variable != null) {
      return {
        matched: full,
        kind,
        nullable,
        variable,
      };
    }

    return evaluted;
  }, undefined);
}
