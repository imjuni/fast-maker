import type THandlerNode from '#compiler/interface/THandlerNode';
import type IRouteHandler from '#route/interface/IRouteHandler';

export default interface IStage02Log {
  fileExists: IRouteHandler[];
  fileNotFound: IRouteHandler[];
  functionNotFound: { filename: string; nodes: THandlerNode[] }[];
  functionExists: { filename: string; nodes: THandlerNode[] }[];
  routePathUnique: { filename: string; nodes: THandlerNode[] }[];
  routePathDuplicate: { filename: string; nodes: THandlerNode[] }[];
}
