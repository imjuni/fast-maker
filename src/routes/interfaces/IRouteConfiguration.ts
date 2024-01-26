import type { IHandlerRequestParameterType } from '#/compilers/type-tools/interfaces/IHandlerRequestParameterType';
import type { CE_ROUTE_METHOD } from '#/routes/const-enum/CE_ROUTE_METHOD';

export interface IRouteConfiguration {
  /** route method */
  methods: CE_ROUTE_METHOD[];

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
  typeArgument?: IHandlerRequestParameterType;

  /** handler file path */
  sourceFilePath: string;
}
