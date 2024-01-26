import type { TRouteOption } from '#/configs/interfaces/TRouteOption';
import getMethodBar from '#/modules/getMethodBar';
import getMethodColor from '#/modules/getMethodColor';
import type { CE_ROUTE_METHOD } from '#/routes/const-enum/CE_ROUTE_METHOD';
import type { IRouteConfiguration } from '#/routes/interfaces/IRouteConfiguration';
import { posixJoin } from '#/tools/posixJoin';
import chalk from 'chalk';
import Table from 'cli-table3';
import type { Entries } from 'type-fest';

export function createTable(
  option: Pick<TRouteOption['base'], 'handler'>,
  handlerFiles: Record<CE_ROUTE_METHOD, IRouteConfiguration[]>,
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
      return route.methods.reduce(
        (next, method) => {
          return { ...next, [method]: [...next[method], route] };
        },
        { ...aggregation },
      );
    },
    {} as Record<CE_ROUTE_METHOD, IRouteConfiguration[]>,
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
