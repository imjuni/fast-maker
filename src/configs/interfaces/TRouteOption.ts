import type IBaseOption from '#configs/interfaces/IBaseOption';
import type IResolvedPaths from '#configs/interfaces/IResolvedPaths';

export interface IRouteOption {
  kind: 'route';

  /** max worker count */
  maxWorkers?: number;

  /** route code generation worker timeout: default 90 seconds */
  workerTimeout: number;
}

export type TRouteBaseOption = IBaseOption & IRouteOption;

export type TRouteOption = IBaseOption & IResolvedPaths & IRouteOption;
