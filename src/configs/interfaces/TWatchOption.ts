import type { IBaseOption } from '#/configs/interfaces/IBaseOption';
import type { IResolvedPaths } from '#/configs/interfaces/IResolvedPaths';

export interface IWatchOption {
  kind: 'watch';
  /**
   * watch file debounceTime. unit use milliseconds.
   * @default 1000
   * */
  debounceTime: number;
}

export type TWatchBaseOption = IBaseOption & IWatchOption;

export type TWatchOption = IBaseOption & IResolvedPaths & IWatchOption;
