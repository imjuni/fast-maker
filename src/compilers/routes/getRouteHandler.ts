import type { IImportConfiguration } from '#/compilers/interfaces/IImportConfiguration';
import { getResolvedImportedModules } from '#/compilers/navigate/getResolvedImportedModules';
import { getResolvedInFileImportedModules } from '#/compilers/navigate/getResolvedInFileImportedModules';
import { getRouteNode } from '#/compilers/routes/getRouteNode';
import { getRouteOptions } from '#/compilers/routes/getRouteOptions';
import { CE_REQUEST_KIND } from '#/compilers/type-tools/const-enum/CE_REQUEST_KIND';
import { getRequestTypeParameter } from '#/compilers/type-tools/getRequestTypeParameter';
import { getTypeReferences } from '#/compilers/type-tools/getTypeReferences';
import type { IBaseOption } from '#/configs/interfaces/IBaseOption';
import { dedupeImportConfiguration } from '#/generators/dedupeImportConfiguration';
import { getImportConfigurationFromResolutions } from '#/generators/getImportConfigurationFromResolutions';
import { getExtraMethod } from '#/routes/extractors/getExtraMethod';
import type { IRouteConfiguration } from '#/routes/interfaces/IRouteConfiguration';
import { getRoutePath } from '#/routes/paths/getRoutePath';
import { appendPostfixHash } from '#/tools/appendPostfixHash';
import { getHash } from '#/tools/getHash';
import { getRelativeModulePath } from '#/tools/getRelativeModulePath';
import { removeHandlerPath } from '#/tools/removeHandlerPath';
import path from 'node:path';
import type * as tsm from 'ts-morph';

export async function getRouteHandler(
  sourceFile: tsm.SourceFile,
  options: Pick<IBaseOption, 'output' | 'handler' | 'extKind'>,
) {
  const node = getRouteNode(sourceFile);

  if (node == null) {
    return undefined;
  }

  const resolvedHandlerPath = path.resolve(options.handler);
  const resolvedOutputPath = path.resolve(options.output);
  const relativeFilePath = removeHandlerPath(sourceFile.getFilePath().toString(), resolvedHandlerPath);
  const hash = getHash(relativeFilePath, process.env.HASH_SECRET);
  const parameters = node.node.getParameters();
  const parameter = parameters.at(0);
  const typeReferenceNodes = parameter == null ? [] : getTypeReferences(parameter);
  const extraMethods = await getExtraMethod(sourceFile.getFilePath().toString());
  const routePathConfiguration = await getRoutePath(relativeFilePath);
  const routeOptions = getRouteOptions(sourceFile);
  const importedModules = [
    ...getResolvedImportedModules({
      sourceFile,
      options: { ...options, output: resolvedOutputPath },
      typeReferenceNodes,
    }),
    ...getResolvedInFileImportedModules({
      sourceFile,
      options: { ...options, output: resolvedOutputPath },
      typeReferenceNodes,
    }),
  ];
  const typeArgument =
    parameter == null
      ? {
          request: CE_REQUEST_KIND.PROPERTY_SIGNATURE,
          kind: undefined,
          text: '',
        }
      : getRequestTypeParameter(parameter);

  const routeConfiguration: IRouteConfiguration = {
    methods: [routePathConfiguration.method, ...extraMethods],
    routePath: routePathConfiguration.routePath,
    hash,
    hasOption: routeOptions.has.option,
    handlerName: `handler_${hash}`,
    typeArgument,
    sourceFilePath: sourceFile.getFilePath().toString(),
  };

  const imports = [
    ...dedupeImportConfiguration(getImportConfigurationFromResolutions(importedModules)),
    routeOptions.has.option
      ? ({
          hash,
          namedBindings: [
            {
              name: 'option',
              alias: `${appendPostfixHash('option', hash)}`,
              isPureType: false,
            },
          ],
          importFile: sourceFile.getFilePath().toString(),
          relativePath: getRelativeModulePath({
            modulePath: sourceFile.getFilePath().toString(),
            output: options.output,
            extKind: options.extKind,
          }),
        } satisfies IImportConfiguration)
      : undefined,
  ].filter((statement): statement is IImportConfiguration => statement != null);

  return {
    imports,
    routes: [routeConfiguration],
  };
}
