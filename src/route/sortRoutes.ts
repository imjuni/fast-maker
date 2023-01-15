import logger from '#module/logging/logger';
import type IRouteConfiguration from '#route/interface/IRouteConfiguration';
import type TMethodType from '#route/interface/TMethodType';
import { isError, typedkey } from 'my-easy-fp';
import { isDescendant } from 'my-node-fp';

const log = logger();

function sort(routes: IRouteConfiguration[]): IRouteConfiguration[] {
  if (routes.length <= 0) {
    return routes;
  }

  const desc = routes.sort((l, r) => r.routePath.localeCompare(l.routePath));

  const chunked = desc.reduce<{ prev: string; chunk: Record<string, IRouteConfiguration[]> }>(
    (chunking, current) => {
      const next = { ...chunking };

      try {
        // skip chunking action for root route path
        if (current.routePath === '/') {
          next.chunk[current.routePath] = [current];
          return next;
        }

        if (chunking.prev == null || chunking.prev === '') {
          next.prev = current.routePath;
          next.chunk[current.routePath] = [...(next.chunk[current.routePath] ?? []), current];
          return next;
        }

        if (isDescendant(current.routePath, chunking.prev, '/') === true) {
          const backup = next.chunk[next.prev];

          delete next.chunk[next.prev];

          next.prev = current.routePath;
          next.chunk[current.routePath] = [...backup, current];

          return next;
        }

        next.prev = current.routePath;
        next.chunk[current.routePath] = [current];

        return next;
      } catch (catched) {
        const err = isError(catched) ?? new Error('unknown error raised');

        log.debug(err.message);
        log.debug(err.stack);

        return next;
      }
    },
    { prev: '', chunk: {} },
  );

  const keys = typedkey(chunked.chunk);
  const asc = keys.sort((l, r) => l.localeCompare(r));

  return asc.map((key) => chunked.chunk[key]).flat();
}

export default function sortRoutes(routes: IRouteConfiguration[]): IRouteConfiguration[] {
  const classficationed = routes.reduce<Record<TMethodType, IRouteConfiguration[]>>(
    (classfication, route) => {
      return {
        ...classfication,
        [route.method]: [...classfication[route.method], route],
      };
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

  const getHandlers = sort(classficationed.get);
  const postHandlers = sort(classficationed.post);
  const putHandlers = sort(classficationed.put);
  const deleteHandlers = sort(classficationed.delete);
  const optionsHandlers = sort(classficationed.options);
  const headHandlers = sort(classficationed.head);
  const patchHandlers = sort(classficationed.patch);
  const allHandlers = sort(classficationed.all);

  return [
    ...getHandlers,
    ...postHandlers,
    ...putHandlers,
    ...deleteHandlers,
    ...optionsHandlers,
    ...headHandlers,
    ...patchHandlers,
    ...allHandlers,
  ];
}
