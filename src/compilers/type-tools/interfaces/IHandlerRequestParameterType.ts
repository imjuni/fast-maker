import type { CE_REQUEST_KIND } from '#/compilers/type-tools/const-enum/CE_REQUEST_KIND';
import type * as tsm from 'ts-morph';

export interface IHandlerRequestParameterType {
  request: CE_REQUEST_KIND;
  kind?: tsm.SyntaxKind;
  text: string;
}
