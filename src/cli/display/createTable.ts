import type { TRouteOption } from '#configs/interfaces/TRouteOption';
import type { TWatchOption } from '#configs/interfaces/TWatchOption';
import getMethodBar from '#modules/getMethodBar';
import getMethodColor from '#modules/getMethodColor';
import type { CE_ROUTE_METHOD } from '#routes/interface/CE_ROUTE_METHOD';
import type IRouteConfiguration from '#routes/interface/IRouteConfiguration';
import type IRouteHandler from '#routes/interface/IRouteHandler';
import posixJoin from '#tools/posixJoin';
import chalk from 'chalk';
import Table from 'cli-table3';
import type { Entries } from 'type-fest';

export default function createTable(
  option: Pick<TRouteOption, 'handler'> | Pick<TWatchOption, 'handler'>,
  handlerFiles: Record<CE_ROUTE_METHOD, IRouteHandler[]>,
  routes: IRouteConfiguration[],
): Table.Table {
  const table = new Table({
    head: [
      chalk.blueBright.bold('Method'),
      chalk.blueBright.bold('Handler path'),
      chalk.blueBright.bold('Count\n(n/total)'),
    ],
    colWidths: [13, 68, 12], // 102
    wordWrap: true,
  });

  const routeMap = routes.reduce<Record<CE_ROUTE_METHOD, IRouteConfiguration[]>>(
    (aggregation, route) => {
      return { ...aggregation, [route.method]: [...aggregation[route.method], route] };
    },
    {
      get: [],
      post: [],
      put: [],
      delete: [],
      patch: [],
      options: [],
      head: [],
      all: [],
    },
  );

  (Object.entries(routeMap) as Entries<typeof routeMap>).forEach(([method, route]) => {
    table.push([
      chalk.white.bold[getMethodColor(method, 'background')](getMethodBar(method)),
      posixJoin(option.handler, method),
      `${route.length}/ ${handlerFiles[method].length}`,
    ]);
  });

  return table;
}
