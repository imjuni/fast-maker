import type IBaseOption from '#configs/interfaces/IBaseOption';
import type IResolvedPaths from '#configs/interfaces/IResolvedPaths';

export interface IWatchOption {
  kind: 'watch';
  debounceTime: number;
}

export type TWatchBaseOption = IBaseOption & IWatchOption;

export type TWatchOption = IBaseOption & IResolvedPaths & IWatchOption;