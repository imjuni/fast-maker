import IConfig from '#config/interface/IConfig';
import IRouteConfiguration from '#route/interface/IRouteConfiguration';
import { isNotEmpty } from 'my-easy-fp';

interface IRouteCodeGenerator {
  option: IConfig;
  routeConfigurations: IRouteConfiguration[];
}

export default function routeCodeGenerator({ routeConfigurations }: IRouteCodeGenerator) {
  const codes = routeConfigurations.map((routeConfiguration) => {
    const handler = routeConfiguration.handlerName;
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
