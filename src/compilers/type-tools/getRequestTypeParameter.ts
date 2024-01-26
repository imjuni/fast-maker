import { getFastifyRequestTypeArgument } from '#/compilers/type-tools/getFastifyRequestTypeArgument';
import { getTypePropertySignature } from '#/compilers/type-tools/getTypePropertySignature';
import type * as tsm from 'ts-morph';

export function getRequestTypeParameter(parameter: tsm.ParameterDeclaration) {
  const parameterNode = parameter.getTypeNodeOrThrow();

  if (parameterNode.getText() === 'FastifyRequest') {
    return getFastifyRequestTypeArgument(parameter);
  }

  return getTypePropertySignature(parameter);
}
