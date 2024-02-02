import type { ITableSummaryData } from '#/cli/interfaces/ITableSummaryData';
import { getMethodBar } from '#/modules/getMethodBar';
import { getMethodColor } from '#/modules/getMethodColor';
import { CE_ROUTE_METHOD } from '#/routes/const-enum/CE_ROUTE_METHOD';
import type { IRouteConfiguration } from '#/routes/interfaces/IRouteConfiguration';
import chalk from 'chalk';
import Table from 'cli-table3';

export function createTable(routes: IRouteConfiguration[]): Table.Table {
  const table = new Table({
    head: [chalk.blueBright.bold('Method'), chalk.blueBright.bold('Route paths'), chalk.blueBright.bold('Count')],
    colWidths: [13, 68, 12], // 102
    wordWrap: true,
  });

  const tableSummary = routes.reduce<ITableSummaryData>((aggregation, route) => {
    const next = { ...aggregation };

    route.methods.forEach((method) => {
      next[method] = { endpoint: [...(next[method]?.endpoint ?? []), route.routePath] };
    });

    return next;
  }, {});

  const methodOrder = [
    CE_ROUTE_METHOD.GET,
    CE_ROUTE_METHOD.POST,
    CE_ROUTE_METHOD.PUT,
    CE_ROUTE_METHOD.DELETE,
    CE_ROUTE_METHOD.PATCH,
    CE_ROUTE_METHOD.SEARCH,
    CE_ROUTE_METHOD.HEAD,
    CE_ROUTE_METHOD.OPTIONS,
    CE_ROUTE_METHOD.TRACE,
    CE_ROUTE_METHOD.PROPFIND,
    CE_ROUTE_METHOD.PROPPATCH,
    CE_ROUTE_METHOD.MKCOL,
    CE_ROUTE_METHOD.COPY,
    CE_ROUTE_METHOD.MOVE,
    CE_ROUTE_METHOD.LOCK,
    CE_ROUTE_METHOD.UNLOCK,
  ];

  methodOrder.forEach((method) => {
    const summary = tableSummary[method];

    if (summary != null) {
      table.push([
        chalk.white.bold[getMethodColor(method, 'background')](getMethodBar(method)),
        summary.endpoint.join('\n'),
        `${summary.endpoint.length}`,
      ]);
    }
  });

  return table;
}
