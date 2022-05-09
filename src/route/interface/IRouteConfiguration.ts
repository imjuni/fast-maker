import * as tsm from 'ts-morph';
import TMethodType from '@route/interface/TMethodType';

export default interface IRouteConfiguration {
  method: TMethodType;
  routePath: string;

  hash: string;
  hasOption: boolean;
  typeArgument?: string;

  sourceFilePath: string;
  source: tsm.SourceFile;
}
