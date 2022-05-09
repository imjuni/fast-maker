// import consola from 'consola';
import { isEmpty } from 'my-easy-fp';
import * as tsm from 'ts-morph';

interface IGetFirstTypeArgument {
  parameter: tsm.ParameterDeclaration;
}

export default function getPropertySignatures({ parameter }: IGetFirstTypeArgument): tsm.Symbol[] {
  const typeName = parameter.getType().getSymbolOrThrow().getEscapedName();

  if (typeName === 'FastifyRequest') {
    const typeArguments = parameter.getType().getTypeArguments();
    const [headTypeArgument] = typeArguments;

    if (isEmpty(headTypeArgument)) {
      throw new Error('Cannot found first type argument in parameter');
    }

    const propertySymbols = headTypeArgument.getProperties();
    return propertySymbols;
  }

  const propertySymbols = parameter.getType().getProperties();
  return propertySymbols;
}
