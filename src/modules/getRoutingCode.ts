import type IConfig from '#configs/interfaces/IConfig';

export default function getRoutingCode({
  config,
  imports,
  routes,
}: {
  config: IConfig;
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
