import type IRouteConfiguration from '#routes/interface/IRouteConfiguration';
import type TMethodType from '#routes/interface/TMethodType';
import sortRoutePath from '#routes/sortRoutePath';

export default function sortRoutePaths(routes: IRouteConfiguration[]): IRouteConfiguration[] {
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

  const getHandlers = sortRoutePath(classficationed.get);
  const postHandlers = sortRoutePath(classficationed.post);
  const putHandlers = sortRoutePath(classficationed.put);
  const deleteHandlers = sortRoutePath(classficationed.delete);
  const optionsHandlers = sortRoutePath(classficationed.options);
  const headHandlers = sortRoutePath(classficationed.head);
  const patchHandlers = sortRoutePath(classficationed.patch);
  const allHandlers = sortRoutePath(classficationed.all);

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
