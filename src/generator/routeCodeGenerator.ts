import getHandlerNameWithoutSquareBracket from '@generator/getHandlerNameWithoutSquareBracket';
import { IOption } from '@module/IOption';
import IRouteConfiguration from '@route/interface/IRouteConfiguration';
import { isNotEmpty } from 'my-easy-fp';
import * as path from 'path';

interface IRouteCodeGenerator {
  option: IOption;
  routeConfigurations: IRouteConfiguration[];
}

export default function routeCodeGenerator({ routeConfigurations }: IRouteCodeGenerator) {
  const codes = routeConfigurations.map((routeConfiguration) => {
    const filename = path.basename(routeConfiguration.sourceFilePath, '.ts');
    const handler = `${getHandlerNameWithoutSquareBracket(filename)}_${routeConfiguration.hash}`;
    const typeArgument =
      isNotEmpty(routeConfiguration.typeArgument) && routeConfiguration.typeArgument !== ''
        ? `<${routeConfiguration.typeArgument}>`
        : '';

    const code = routeConfiguration.hasOption
      ? `fastify.${routeConfiguration.method}${typeArgument}('${routeConfiguration.routePath}', option_${routeConfiguration.hash}, ${handler});`
      : `fastify.${routeConfiguration.method}${typeArgument}('${routeConfiguration.routePath}', ${handler});`;

    return code;
  });

  return codes;
}
