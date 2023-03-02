import type THandlerNode from '#compilers/interfaces/THandlerNode';

export default interface IStage02Log {
  routePathUnique: { filename: string; nodes: THandlerNode[] }[];
  routePathDuplicate: { filename: string; nodes: THandlerNode[] }[];
}
