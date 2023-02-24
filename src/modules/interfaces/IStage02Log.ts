import type THandlerNode from '#compilers/interfaces/THandlerNode';
import type IRouteHandler from '#routes/interface/IRouteHandler';

export default interface IStage02Log {
  fileExists: IRouteHandler[];
  fileNotFound: IRouteHandler[];
  functionNotFound: { filename: string; nodes: THandlerNode[] }[];
  functionExists: { filename: string; nodes: THandlerNode[] }[];
  routePathUnique: { filename: string; nodes: THandlerNode[] }[];
  routePathDuplicate: { filename: string; nodes: THandlerNode[] }[];
}
