import TMethodType from '#route/interface/TMethodType';
import * as tsm from 'ts-morph';

export default interface IRouteConfiguration {
  method: TMethodType;
  routePath: string;

  hash: string;
  hasOption: boolean;
  handlerName: string;
  typeArgument?: string;

  sourceFilePath: string;
  source: tsm.SourceFile;
}
