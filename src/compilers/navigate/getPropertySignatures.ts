import { atOrThrow } from 'my-easy-fp';
import type * as tsm from 'ts-morph';

interface IGetFirstTypeArgument {
  parameter: tsm.ParameterDeclaration;
}

export function getPropertySignatures({ parameter }: IGetFirstTypeArgument): tsm.Symbol[] {
  const typeName = parameter.getType().getSymbolOrThrow().getEscapedName();

  if (typeName === 'FastifyRequest') {
    const typeArguments = parameter.getType().getTypeArguments();
    const headTypeArgument = atOrThrow(typeArguments, 0);
    const propertySymbols = headTypeArgument.getProperties();
    return propertySymbols;
  }

  const propertySymbols = parameter.getType().getProperties();
  return propertySymbols;
}
