import { CE_REQUEST_KIND } from '#/compilers/type-tools/const-enum/CE_REQUEST_KIND';
import type { IHandlerRequestParameterType } from '#/compilers/type-tools/interfaces/IHandlerRequestParameterType';
import { atOrThrow } from 'my-easy-fp';
import * as tsm from 'ts-morph';

export function getFastifyRequestTypeArgument(parameter: tsm.ParameterDeclaration): IHandlerRequestParameterType {
  const parameterNode = parameter.getTypeNodeOrThrow();
  const typeArguments = parameterNode.asKind(tsm.SyntaxKind.TypeReference)?.getTypeArguments() ?? [];

  // case 01. FastifyRequest에 TypeArguments가 없는 경우
  // case 01. FastifyRequest don't pass generic type arguments
  if (typeArguments.length <= 0) {
    return {
      request: CE_REQUEST_KIND.FASTIFY_REQUEST,
      kind: undefined,
      text: '',
    };
  }

  const typeArgument = atOrThrow(typeArguments, 0);

  // case 02. FastifyRequest를 사용하여 타입을 전달하는 경우
  // case 02. FastifyRequest get one more generic type arguments
  return {
    request: CE_REQUEST_KIND.FASTIFY_REQUEST,
    kind: typeArgument.getKind(),
    text: typeArgument.getText(),
  };
}
