import type { IBaseOption } from '#/configs/interfaces/IBaseOption';
import type { IResolvedPaths } from '#/configs/interfaces/IResolvedPaths';

export interface IRouteOptionKind {
  kind: 'route';
}

export type TRouteBaseOption = IBaseOption & IRouteOptionKind;

export type TRouteOption = TRouteBaseOption & { path: IResolvedPaths };
