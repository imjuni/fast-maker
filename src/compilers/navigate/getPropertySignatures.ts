import { atOrThrow } from 'my-easy-fp';
import * as tsm from 'ts-morph';

export function getPropertySignatures(parameter: tsm.ParameterDeclaration): tsm.Symbol[] {
  const parameterNode = parameter.getTypeNodeOrThrow();

  if (parameterNode.getText().indexOf('FastifyRequest') >= 0) {
    const typeArguments = parameterNode.asKindOrThrow(tsm.SyntaxKind.TypeReference).getTypeArguments();

    if (typeArguments.length <= 0) {
      return [];
    }

    const typeArgument = atOrThrow(typeArguments, 0);
    const propertySymbols = typeArgument.getType().getProperties();
    return propertySymbols;
  }

  const propertySymbols = parameter.getType().getProperties();
  return propertySymbols;
}
