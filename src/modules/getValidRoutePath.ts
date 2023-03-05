import type IReason from '#compilers/interfaces/IReason';
import reasons from '#modules/reasons';
import type summaryRouteHandlerFiles from '#modules/summaryRouteHandlerFiles';
import { CE_ROUTE_INFO_KIND } from '#routes/interface/CE_ROUTE_INFO_KIND';
import type { CE_ROUTE_METHOD } from '#routes/interface/CE_ROUTE_METHOD';
import methods from '#routes/interface/methods';
import type { TPickRouteInfo } from '#routes/interface/TRouteInfo';
import chalk from 'chalk';
import { keyBys } from 'my-easy-fp';
import type { AsyncReturnType } from 'type-fest';

export default function getValidRoutePath(
  handlerMap: AsyncReturnType<typeof summaryRouteHandlerFiles>,
): TPickRouteInfo<typeof CE_ROUTE_INFO_KIND.VALIDATE_ROUTE_HANDLER_FILE> {
  const splittedHandlerMap = methods.reduce<
    Record<CE_ROUTE_METHOD, Record<string, TPickRouteInfo<typeof CE_ROUTE_INFO_KIND.ROUTE>[]>>
  >(
    (aggregation, method) => {
      return { ...aggregation, [method]: keyBys(handlerMap.summary[method], 'routePath') };
    },
    { get: {}, post: {}, put: {}, delete: {}, options: {}, head: {}, patch: {}, all: {} },
  );

  const validated = methods
    .map((method) => {
      const handlers = splittedHandlerMap[method];

      const asdf = Object.values(handlers).reduce<{
        duplicate: TPickRouteInfo<typeof CE_ROUTE_INFO_KIND.ROUTE>[];
        valid: TPickRouteInfo<typeof CE_ROUTE_INFO_KIND.ROUTE>[];
      }>(
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

  const validationMap = validated.valid.reduce<
    Record<CE_ROUTE_METHOD, TPickRouteInfo<typeof CE_ROUTE_INFO_KIND.ROUTE>[]>
  >(
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

  return { kind: CE_ROUTE_INFO_KIND.VALIDATE_ROUTE_HANDLER_FILE, invalid: validated.duplicate, valid: validationMap };
}
