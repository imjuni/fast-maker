import type TMethodType from '#route/interface/TMethodType';

export default interface IRouteConfiguration {
  method: TMethodType;
  routePath: string;

  hash: string;
  hasOption: boolean;
  handlerName: string;
  typeArgument?: string;

  sourceFilePath: string;
  // source: SourceFile;
}
