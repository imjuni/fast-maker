import type IBaseOption from '#configs/interfaces/IBaseOption';

export default function getRoutingCode({
  config,
  imports,
  routes,
}: {
  config: IBaseOption;
  imports: string[];
  routes: string[];
}) {
  const codes = [
    `import type { FastifyInstance } from 'fastify';`,
    ...imports,
    '\n',
    `export ${config.useDefaultExport ? 'default ' : ''}function ${
      config.routeFunctionName
    }(fastify: FastifyInstance): void {`,
    ...routes,
    `}`,
  ];

  return codes.join('\n');
}
