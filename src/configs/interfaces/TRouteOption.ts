import type IBaseOption from '#configs/interfaces/IBaseOption';
import type IResolvedPaths from '#configs/interfaces/IResolvedPaths';

export interface IRouteOption {
  kind: 'route';
}

export type TRouteBaseOption = IBaseOption & IRouteOption;

export type TRouteOption = IBaseOption & IResolvedPaths & IRouteOption;
