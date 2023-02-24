import type IImportConfiguration from '#compilers/interfaces/IImportConfiguration';
import type IReason from '#compilers/interfaces/IReason';
import type { THandlerWithoutNode } from '#compilers/interfaces/THandlerNode';
import type IConfig from '#configs/interfaces/IConfig';
import type IWatchConfig from '#configs/interfaces/IWatchConfig';
import type IRouteConfiguration from '#routes/interface/IRouteConfiguration';
import type IRouteHandler from '#routes/interface/IRouteHandler';
import type { Merge } from 'type-fest';

export default interface ILogBox {
  config: IConfig | Merge<IConfig, IWatchConfig> | undefined;
  routeHandlers: IRouteHandler[];
  reasons: IReason[];
  importConfigurations: IImportConfiguration[];
  routeConfigurations: IRouteConfiguration[];
  importCodes: string[];
  routeCodes: string[];
  fileExists: IRouteHandler[];
  fileNotFound: IRouteHandler[];
  functionExists: { filename: string; nodes: THandlerWithoutNode[] }[];
  functionNotFound: { filename: string; nodes: THandlerWithoutNode[] }[];
  routePathDuplicate: { filename: string; nodes: THandlerWithoutNode[] }[];
  routePathUnique: { filename: string; nodes: THandlerWithoutNode[] }[];
}
