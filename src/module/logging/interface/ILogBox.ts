import type IImportConfiguration from '#compiler/interface/IImportConfiguration';
import type IReason from '#compiler/interface/IReason';
import type { THandlerWithoutNode } from '#compiler/interface/THandlerNode';
import type IConfig from '#config/interface/IConfig';
import type IWatchConfig from '#config/interface/IWatchConfig';
import type IRouteConfiguration from '#route/interface/IRouteConfiguration';
import type IRouteHandler from '#route/interface/IRouteHandler';
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
