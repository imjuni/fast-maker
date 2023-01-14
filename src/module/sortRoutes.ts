import type IRouteConfiguration from '#route/interface/IRouteConfiguration';
import type TMethodType from '#route/interface/TMethodType';

function sort(routes: IRouteConfiguration[]): IRouteConfiguration[] {
  if (routes.length <= 0) {
    return routes;
  }

  return routes.sort((l, r) => r.routePath.localeCompare(l.routePath));
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
