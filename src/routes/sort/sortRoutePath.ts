import type { IRouteConfiguration } from '#/routes/interfaces/IRouteConfiguration';
import consola from 'consola';
import { isError, type PartialRecord } from 'my-easy-fp';
import { isDescendant } from 'my-node-fp';

export function sortRoutePath(routes: IRouteConfiguration[]): IRouteConfiguration[] {
  if (routes.length <= 0) {
    return routes;
  }

  const desc = routes.sort((l, r) => r.routePath.localeCompare(l.routePath));

  const chunked = desc.reduce<{ prev: string; chunk: PartialRecord<string, IRouteConfiguration[]> }>(
    (chunking, current) => {
      const next = { ...chunking };

      try {
        // skip chunking action for root route path
        if (current.routePath === '/') {
          next.chunk[current.routePath] = [current];
          return next;
        }

        if (chunking.prev === '') {
          next.prev = current.routePath;
          next.chunk[current.routePath] = [...(next.chunk[current.routePath] ?? []), current];
          return next;
        }

        if (isDescendant(current.routePath, chunking.prev, '/') === true) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const backup = next.chunk[next.prev]!;

          next.chunk[next.prev] = undefined;
          next.prev = current.routePath;
          next.chunk[current.routePath] = [...backup, current];

          return next;
        }

        next.prev = current.routePath;
        next.chunk[current.routePath] = [current];

        return next;
      } catch (caught) {
        const err = isError(caught, new Error('unknown error raised'));

        consola.debug(err.message);
        consola.debug(err.stack);

        return next;
      }
    },
    { prev: '', chunk: {} },
  );

  const keys = Object.keys(chunked.chunk);
  const asc = keys.sort((l, r) => l.localeCompare(r));

  return asc
    .map((key) => chunked.chunk[key])
    .filter((value): value is IRouteConfiguration[] => value != null)
    .flat();
}
