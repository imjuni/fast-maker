import { atOrThrow } from 'my-easy-fp';
import type { ParameterDeclaration, Symbol } from 'ts-morph';

interface IGetFirstTypeArgument {
  parameter: ParameterDeclaration;
}

export default function getPropertySignatures({ parameter }: IGetFirstTypeArgument): Symbol[] {
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
