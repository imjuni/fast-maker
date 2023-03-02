import type { TRouteOption } from '#configs/interfaces/TRouteOption';
import type { TWatchOption } from '#configs/interfaces/TWatchOption';
import type { CE_ROUTE_METHOD } from '#routes/interface/CE_ROUTE_METHOD';
import isValidMethod from '#routes/isValidMethod';
import { atOrThrow } from 'my-easy-fp';
import { startSepRemove } from 'my-node-fp';
import path from 'path';

interface IHandlerSummary {
  method: CE_ROUTE_METHOD;
  filePath: string;
  handlerPath: string;
}

export default function getSummaryByMethod(
  filePaths: string[],
  option: Pick<TRouteOption, 'handler' | 'cwd'> | Pick<TWatchOption, 'handler' | 'cwd'>,
): Record<CE_ROUTE_METHOD, IHandlerSummary[]> {
  const handlers = filePaths
    .map((filePath) => {
      const handlerPath = startSepRemove(filePath.replace(option.handler, ''), path.posix.sep);
      const method = atOrThrow(handlerPath.split(path.posix.sep), 0).toLowerCase();

      if (isValidMethod(method)) {
        return { method, filePath, handlerPath };
      }

      return undefined;
    })
    .filter((handler): handler is IHandlerSummary => handler != null);

  const handlerMap = handlers.reduce<Record<CE_ROUTE_METHOD, IHandlerSummary[]>>(
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
    } satisfies Record<CE_ROUTE_METHOD, IHandlerSummary[]>,
  );

  return handlerMap;
}
