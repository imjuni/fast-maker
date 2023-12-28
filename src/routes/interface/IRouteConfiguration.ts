import type { CE_ROUTE_METHOD } from '#/routes/interface/CE_ROUTE_METHOD';

export default interface IRouteConfiguration {
  /** route method */
  method: CE_ROUTE_METHOD;

  /** route path */
  routePath: string;

  /** route hash made by route path */
  hash: string;

  /** this route path have option variable */
  hasOption: boolean;

  /**
   * name of handler with hash
   * @example handle_PDq0q2qANIHiZy5vU3VeCgIYyT8mERjU
   * */
  handlerName: string;

  /**
   * FastifyRequest type arguments
   *
   * @example FastifyRequest<{ Body: IAbility }> type arguments is "{ Body: IAbility }"
   * */
  typeArgument?: string;

  /** handler file path */
  sourceFilePath: string;
}
