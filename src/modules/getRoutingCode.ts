import type IBaseOption from '#/configs/interfaces/IBaseOption';

export default function getRoutingCode({
  option,
  imports,
  routes,
}: {
  option: Pick<IBaseOption, 'useDefaultExport' | 'routeFunctionName'>;
  imports: string[];
  routes: string[];
}) {
  const codes = [
    `import type { FastifyInstance } from 'fastify';`,
    ...imports,
    '\n',
    `export ${option.useDefaultExport ? 'default ' : ''}function ${
      option.routeFunctionName
    }(fastify: FastifyInstance): void {`,
    ...routes,
    `}`,
  ];

  return codes.join('\n');
}
