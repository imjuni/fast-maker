import type IRouteConfiguration from '#route/interface/IRouteConfiguration';

interface IRouteCodeGenerator {
  routeConfigurations: IRouteConfiguration[];
}

export default function routeCodeGenerator({ routeConfigurations }: IRouteCodeGenerator) {
  const codes = routeConfigurations.map((routeConfiguration) => {
    const handler = routeConfiguration.handlerName;
    const typeArgument =
      routeConfiguration.typeArgument != null && routeConfiguration.typeArgument !== ''
        ? `<${routeConfiguration.typeArgument}>`
        : '';

    const code = routeConfiguration.hasOption
      ? `fastify.${routeConfiguration.method}${typeArgument}('${routeConfiguration.routePath}', option_${routeConfiguration.hash}, ${handler});`
      : `fastify.${routeConfiguration.method}${typeArgument}('${routeConfiguration.routePath}', ${handler});`;

    return code;
  });

  return codes;
}
