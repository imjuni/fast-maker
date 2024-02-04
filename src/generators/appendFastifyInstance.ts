import type { IImportConfiguration } from '#/compilers/interfaces/IImportConfiguration';
import { CE_FASTIFY_TYPE_NAME } from '#/generators/const-enum/CE_FASTIFY_TYPE_NAME';

export function appendFastifyInstance(importConfigurations: IImportConfiguration[]): IImportConfiguration[] {
  const fastifyImport = importConfigurations
    .filter((importConfiguration) => {
      return importConfiguration.relativePath === CE_FASTIFY_TYPE_NAME.FASTIFY_MODULE;
    })
    .at(0);

  const otherImport = importConfigurations.filter((importConfiguration) => {
    return importConfiguration.relativePath !== CE_FASTIFY_TYPE_NAME.FASTIFY_MODULE;
  });

  if (fastifyImport == null) {
    return otherImport;
  }

  const findedFastifyInstance = fastifyImport.namedBindings.find(
    (namedBinding) => namedBinding.name === CE_FASTIFY_TYPE_NAME.FASTIFY_INSTANCE,
  );

  if (findedFastifyInstance != null) {
    return importConfigurations;
  }

  const nextFastifyImport = {
    ...fastifyImport,
    namedBindings: [
      ...fastifyImport.namedBindings,
      {
        name: CE_FASTIFY_TYPE_NAME.FASTIFY_INSTANCE,
        alias: CE_FASTIFY_TYPE_NAME.FASTIFY_INSTANCE,
        isPureType: true,
      },
    ],
  };

  return [nextFastifyImport, ...otherImport];
}
