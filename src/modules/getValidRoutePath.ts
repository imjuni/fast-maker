import type IReason from '#compilers/interfaces/IReason';
import type doMethodAggregator from '#modules/doMethodAggregator';
import reasons from '#modules/reasons';
import type { CE_ROUTE_METHOD } from '#routes/interface/CE_ROUTE_METHOD';
import type IRouteHandler from '#routes/interface/IRouteHandler';
import methods from '#routes/interface/methods';
import chalk from 'chalk';
import { keyBys } from 'my-easy-fp';
import type { AsyncReturnType } from 'type-fest';

export default function getValidRoutePath(handlerMap: AsyncReturnType<typeof doMethodAggregator>): {
  duplicate: IRouteHandler[];
  valid: Record<CE_ROUTE_METHOD, IRouteHandler[]>;
} {
  const splittedHandlerMap = methods.reduce<Record<CE_ROUTE_METHOD, Record<string, IRouteHandler[]>>>(
    (aggregation, method) => {
      return { ...aggregation, [method]: keyBys(handlerMap[method], 'routePath') };
    },
    { get: {}, post: {}, put: {}, delete: {}, options: {}, head: {}, patch: {}, all: {} },
  );

  const validated = methods
    .map((method) => {
      const handlers = splittedHandlerMap[method];

      const asdf = Object.values(handlers).reduce<{ duplicate: IRouteHandler[]; valid: IRouteHandler[] }>(
        (aggregation, handler) => {
          if (handler.length > 1) {
            return { ...aggregation, duplicate: [...aggregation.duplicate, ...handler] };
          }
          return { ...aggregation, valid: [...aggregation.valid, ...handler] };
        },
        { duplicate: [], valid: [] },
      );

      return asdf;
    })
    .reduce(
      (aggregation, handlers) => {
        return {
          ...aggregation,
          duplicate: [...aggregation.duplicate, ...handlers.duplicate],
          valid: [...aggregation.valid, ...handlers.valid],
        };
      },
      { duplicate: [], valid: [] },
    );

  const validationMap = validated.valid.reduce<Record<CE_ROUTE_METHOD, IRouteHandler[]>>(
    (aggregation, handler) => {
      return { ...aggregation, [handler.method]: [...aggregation[handler.method], handler] };
    },
    {
      get: [],
      post: [],
      put: [],
      delete: [],
      options: [],
      head: [],
      patch: [],
      all: [],
    },
  );

  reasons.add(
    ...validated.duplicate.map((duplicate) => {
      return {
        type: 'error',
        message: `Found duplicated routePath(${chalk.red(`[${duplicate.method}] ${duplicate.routePath}`)}): ${
          duplicate.filePath
        }`,
        filePath: duplicate.filePath,
      } satisfies IReason;
    }),
  );

  return { duplicate: validated.duplicate, valid: validationMap };
}
