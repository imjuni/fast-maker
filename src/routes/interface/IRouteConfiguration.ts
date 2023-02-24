import type TMethodType from '#routes/interface/TMethodType';

export default interface IRouteConfiguration {
  /** route method */
  method: TMethodType;
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
