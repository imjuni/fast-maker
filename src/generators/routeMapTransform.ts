import type { IRouteConfiguration } from '#/routes/interfaces/IRouteConfiguration';
import type { HTTPMethods } from 'fastify';

interface IAggregatedRoutePath {
  method: HTTPMethods;
  filePath: string;
  routePath: string;
}

/**
 * key is method
 * @example get
 */
type TAggregatedRoute = Record<string, IAggregatedRoutePath>;

/**
 * key is route-path
 * @example superhero/:id/ability/:id
 */
type TAggregatedRouteMap = Record<string, TAggregatedRoute>;

export function routeMapTransform(routeConfigurations: IRouteConfiguration[]) {
  return routeConfigurations.reduce<TAggregatedRouteMap>((aggregation, route) => {
    const next = { ...aggregation };

    route.methods.forEach((method) => {
      if (next[route.routePath] == null) {
        next[route.routePath] = {
          [method]: {
            method,
            routePath: route.routePath,
            filePath: route.sourceFilePath,
          },
        };
      } else {
        next[route.routePath] = {
          ...next[route.routePath],
          [method]: {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ...next[route.routePath]![method],
            method,
            routePath: route.routePath,
            filePath: route.sourceFilePath,
          },
        };
      }
    });

    return next;
  }, {});
}

// const routeMap = new Map<string, { filePath: string; routePath: string; method: string }[]>(['asdfasdf/asdfasdf/asdf', []]);
// export default routeMap;
