import { CE_ROUTE_PATH_KIND } from '#/routes/const-enum/CE_ROUTE_PATH_KIND';
import type { IRouteVariable } from '#/routes/interfaces/IRouteVariable';
import { extractVariable } from '#/routes/paths/extractVariable';

export function getRouteVariables(rawRoutePath: string) {
  const routePath = rawRoutePath.trim();

  const variables: IRouteVariable[] = [];
  let buf: string[] = [];

  for (let i = 0; i < routePath.length; i += 1) {
    const substring = routePath.substring(i, routePath.length);
    const char = substring.at(0);
    const extracted = extractVariable(substring);

    if (extracted != null) {
      i += extracted.matched.length - 1;

      if (buf.length > 0) {
        const concated = buf.join('');

        variables.push({
          matched: concated,
          kind: CE_ROUTE_PATH_KIND.CONSTANT,
          nullable: false,
          variable: concated,
        });

        buf = [];
      }

      variables.push(extracted);
    } else if (char != null) {
      buf.push(char);
    }
  }

  if (buf.length > 0) {
    const concated = buf.join('');

    variables.push({
      matched: concated,
      kind: CE_ROUTE_PATH_KIND.CONSTANT,
      nullable: false,
      variable: concated,
    });

    buf = [];
  }

  return variables;
}
