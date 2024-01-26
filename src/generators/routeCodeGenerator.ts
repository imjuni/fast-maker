import type { IRouteConfiguration } from '#/routes/interfaces/IRouteConfiguration';

interface IRouteCodeGenerator {
  routeConfigurations: IRouteConfiguration[];
}

export function routeCodeGenerator({ routeConfigurations }: IRouteCodeGenerator) {
  const codes = routeConfigurations.map((routeConfiguration) => {
    const handler = routeConfiguration.handlerName;
    const typeArgument =
      routeConfiguration.typeArgument != null && routeConfiguration.typeArgument !== ''
        ? `<${routeConfiguration.typeArgument}>`
        : '';

    const code = routeConfiguration.hasOption
      ? `fastify.${routeConfiguration.methods}${typeArgument}('${routeConfiguration.routePath}', option_${routeConfiguration.hash}, ${handler});`
      : `fastify.${routeConfiguration.methods}${typeArgument}('${routeConfiguration.routePath}', ${handler});`;

    return code;
  });

  return codes;
}
