import TMethodType from '#route/interface/TMethodType';

export default interface IRouteHandler {
  filename: string;
  method: TMethodType;
  routePath: string;
}
