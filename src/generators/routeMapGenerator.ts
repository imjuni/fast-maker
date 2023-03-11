import type IRouteConfiguration from '#routes/interface/IRouteConfiguration';

interface IRouteMapItem {
  filePath: string;
  routePath: string;
  method: string;
}

function getItemStatement(item: IRouteMapItem): string {
  return `{
    method: "${item.method}",
    filePath: "${item.filePath}",
    routePath: "${item.routePath}",
  }`;
}

export default function routeMapGenerator(routeConfigurations: IRouteConfiguration[]) {
  const routeMap = routeConfigurations.reduce<Record<string, IRouteMapItem[]>>((aggregation, routeConfiguration) => {
    return {
      ...aggregation,
      [routeConfiguration.routePath]: [
        ...(aggregation[routeConfiguration.routePath] ?? []),
        {
          filePath: routeConfiguration.sourceFilePath,
          routePath: routeConfiguration.routePath,
          method: routeConfiguration.method,
        },
      ],
    };
  }, {});

  return [
    `const routeMap = new Map<string, Map<string, { filePath: string; routePath: string; method: string }>>([${Object.entries(
      routeMap,
    )
      .map(([key, value]) => ({ routePath: key, items: value }))
      .map((entry) => {
        return `["${entry.routePath}", new Map<string, { filePath: string; routePath: string; method: string }>([
          ${entry.items.map((item) => `["${item.method}", ${getItemStatement(item)}]`).join(',')}
        ]) ]`;
      })
      .join(',')}]);`,
    '\nexport default routeMap;',
  ].join('\n');
}

// const routeMap = new Map<string, { filePath: string; routePath: string; method: string }[]>(['asdfasdf/asdfasdf/asdf', []]);
// export default routeMap;
