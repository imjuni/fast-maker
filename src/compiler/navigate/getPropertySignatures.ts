import type { ParameterDeclaration, Symbol } from 'ts-morph';

interface IGetFirstTypeArgument {
  parameter: ParameterDeclaration;
}

export default function getPropertySignatures({ parameter }: IGetFirstTypeArgument): Symbol[] {
  const typeName = parameter.getType().getSymbolOrThrow().getEscapedName();

  if (typeName === 'FastifyRequest') {
    const typeArguments = parameter.getType().getTypeArguments();
    const [headTypeArgument] = typeArguments;

    if (headTypeArgument == null) {
      throw new Error('Cannot found first type argument in parameter');
    }

    const propertySymbols = headTypeArgument.getProperties();
    return propertySymbols;
  }

  const propertySymbols = parameter.getType().getProperties();
  return propertySymbols;
}
