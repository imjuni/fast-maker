import { CE_REQUEST_KIND } from '#/compilers/type-tools/const-enum/CE_REQUEST_KIND';
import type { IHandlerRequestParameterType } from '#/compilers/type-tools/interfaces/IHandlerRequestParameterType';
import type * as tsm from 'ts-morph';

export function getTypePropertySignature(parameter: tsm.ParameterDeclaration): IHandlerRequestParameterType {
  const parameterNode = parameter.getTypeNodeOrThrow();

  return {
    request: CE_REQUEST_KIND.PROPERTY_SIGNATURE,
    kind: parameterNode.getKind(),
    text: parameterNode.getText(),
  };
}
