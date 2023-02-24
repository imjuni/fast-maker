import type TMethodType from '#routes/interface/TMethodType';

export default interface IRouteHandler {
  filename: string;
  method: TMethodType;
  routePath: string;
}
