import type { IImportConfiguration } from '#/compilers/interfaces/IImportConfiguration';
import { getPropertySignatures } from '#/compilers/navigate/getPropertySignatures';
import { getResolvedImportedModules } from '#/compilers/navigate/getResolvedImportedModules';
import { getResolvedInFileImportedModules } from '#/compilers/navigate/getResolvedInFileImportedModules';
import { getRouteFunction } from '#/compilers/routes/getRouteFunction';
import { getRouteOptionKind } from '#/compilers/routes/getRouteOptionKind';
import { getRouteOptions } from '#/compilers/routes/getRouteOptions';
import { CE_REQUEST_KIND } from '#/compilers/type-tools/const-enum/CE_REQUEST_KIND';
import { getRequestTypeParameter } from '#/compilers/type-tools/getRequestTypeParameter';
import { getTypeReferences } from '#/compilers/type-tools/getTypeReferences';
import { getPropertySignatureValidateReason } from '#/compilers/validators/getPropertySignatureValidateReason';
import { validatePropertySignature } from '#/compilers/validators/validatePropertySignature';
import { validateTypeReferences } from '#/compilers/validators/validateTypeReferences';
import type { IBaseOption } from '#/configs/interfaces/IBaseOption';
import { getImportConfigurationFromResolutions } from '#/generators/getImportConfigurationFromResolutions';
import type { CE_ROUTE_METHOD } from '#/routes/const-enum/CE_ROUTE_METHOD';
import { getExtraMethod } from '#/routes/extractors/getExtraMethod';
import { getRouteMap } from '#/routes/extractors/getRouteMap';
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
  const node = getRouteFunction(sourceFile);

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
  const isValidTypeReference = validateTypeReferences(sourceFile, typeReferenceNodes);
  const extraMethods = await getExtraMethod(sourceFile.getFilePath().toString());
  const routePathMap = await getRouteMap(sourceFile.getFilePath().toString());
  const routePathConfiguration = await getRoutePath(relativeFilePath, routePathMap);
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

  const isValidPropertySignature =
    parameter == null
      ? []
      : getPropertySignatureValidateReason(
          typeArgument.request,
          node.node,
          validatePropertySignature({
            propertySignatures: getPropertySignatures(parameter),
            kind: typeArgument.request,
          }),
        );

  const routeConfiguration: IRouteConfiguration = {
    methods: [routePathConfiguration.method, ...extraMethods].map((method) => method.toLowerCase() as CE_ROUTE_METHOD),
    routePath: routePathConfiguration.routePath,
    optionKind: routeOptions.node.option != null ? getRouteOptionKind(routeOptions.node.option) : undefined,
    hash,
    hasOption: routeOptions.has.option,
    handlerName: `handler_${hash}`,
    typeArgument,
    sourceFilePath: sourceFile.getFilePath().toString(),
  };

  const imports = [
    ...getImportConfigurationFromResolutions(importedModules),
    {
      hash,
      namedBindings: [
        ...(routeOptions.has.option
          ? [
              {
                name: 'option',
                alias: `${appendPostfixHash('option', hash)}`,
                isPureType: false,
              },
            ]
          : []),
        {
          name: 'handler',
          alias: `${appendPostfixHash('handler', hash)}`,
          isPureType: false,
        },
      ],
      importFile: sourceFile.getFilePath().toString(),
      relativePath: getRelativeModulePath({
        modulePath: sourceFile.getFilePath().toString(),
        output: options.output,
        extKind: options.extKind,
      }),
    } satisfies IImportConfiguration,
  ].filter((statement): statement is IImportConfiguration => statement != null);

  const reasons = [...isValidTypeReference, ...isValidPropertySignature];

  return {
    valid: reasons.length <= 0,
    imports,
    routes: [routeConfiguration],
    reasons,
  };
}
