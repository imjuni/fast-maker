import type { IResolvedImportModule } from '#/compilers/interfaces/IResolvedImportModule';
import getNamedBindingName from '#/compilers/tools/getNamedBindingName';
import { CE_EXT_KIND } from '#/configs/const-enum/CE_EXT_KIND';
import type { IBaseOption } from '#/configs/interfaces/IBaseOption';
import { appendPostfixHash } from '#/tools/appendPostfixHash';
import { getHash } from '#/tools/getHash';
import { getRelativeModulePath } from '#/tools/getRelativeModulePath';
import { atOrUndefined } from 'my-easy-fp';
import { basenames } from 'my-node-fp';
import type * as tsm from 'ts-morph';
import { SyntaxKind } from 'ts-morph';

interface IGetResolvedModuleParam {
  sourceFile: tsm.SourceFile;
  options: { output: IBaseOption['output']; extKind: IBaseOption['extKind'] };
  typeReferenceNodes: tsm.TypeReferenceNode[];
}

/**
 * 이 파일은 in-file이 아닌, 나머지 모든 import statements를 정리한다, 이것은 fastify와 같은 external 모듈을
 * 뜻하는 것이 아니라 그냥 non in-file 모듈을 뜻한다
 */
export function getResolvedImportedModules({
  sourceFile,
  options,
  typeReferenceNodes,
}: IGetResolvedModuleParam): IResolvedImportModule[] {
  const data = {
    type: typeReferenceNodes.map((node) => node.getTypeName()),
    names: typeReferenceNodes.map((node) => node.getTypeName()).map((type) => type.getText()),
    imports: sourceFile.getImportDeclarations(),
  };

  const innerImportDeclarations = data.imports.filter((importDeclaration) => {
    const moduleSpecifierSourceFile = importDeclaration.getModuleSpecifierSourceFile();

    if (moduleSpecifierSourceFile == null) {
      return false;
    }

    return !moduleSpecifierSourceFile.isFromExternalLibrary();
  });

  const fullTypeNameWithImportDeclarations = data.names
    .map((textTypeName) => innerImportDeclarations.map((importDeclaration) => ({ textTypeName, importDeclaration })))
    .flat();

  const typeNameWithImportDeclarations = fullTypeNameWithImportDeclarations.filter((typeNameWithImportDeclaration) => {
    const { textTypeName, importDeclaration } = typeNameWithImportDeclaration;
    const importClause = importDeclaration.getImportClauseOrThrow();
    const defaultImport = importClause.getDefaultImport();

    const namedBindings =
      defaultImport != null
        ? [defaultImport.getText(), ...getNamedBindingName(importClause.getNamedBindings())]
        : getNamedBindingName(importClause.getNamedBindings());

    return namedBindings.find((namedBinding) => namedBinding === textTypeName) != null;
  });

  const nonDedupeResolutions = typeNameWithImportDeclarations.map<IResolvedImportModule>(
    (typeNameWithImportDeclaration) => {
      const importClause = typeNameWithImportDeclaration.importDeclaration.getImportClauseOrThrow();
      const defaultImport = importClause.getDefaultImport();
      const sourceFilePath = typeNameWithImportDeclaration.importDeclaration.getSourceFile().getFilePath();
      const moduleSourceFile = typeNameWithImportDeclaration.importDeclaration.getModuleSpecifierSourceFileOrThrow();
      const moduleSourceFilePath = moduleSourceFile.getFilePath();
      const declarationMap = moduleSourceFile.getExportedDeclarations();
      const relativePath = getRelativeModulePath({
        modulePath: moduleSourceFilePath,
        output: options.output,
        extKind: CE_EXT_KIND.NONE,
      });
      const moduleHash = getHash(relativePath);

      // default import 인 경우
      // 생각 좀 해봤는데 이 경우 filename + hash로 처리하는게 더 효율적인 것 같다(handler 일 때처럼)
      // 이건 여러파일에 동일한 이름으로 export 한 뒤 이름만 바꿔서 사용하는 그런 경우도 있을 것 같아서
      // 오류 방지 차원에서 filename + hash로 처리한다
      if (defaultImport != null) {
        const baseFilename = basenames(relativePath, [
          CE_EXT_KIND.JS,
          CE_EXT_KIND.CJS,
          CE_EXT_KIND.MJS,
          CE_EXT_KIND.TS,
          CE_EXT_KIND.CTS,
          CE_EXT_KIND.MTS,
        ]);
        const defaultImportModuleType = atOrUndefined(declarationMap.get('default') ?? [], 0);

        return {
          isExternalLibraryImport: false,
          hash: moduleHash,
          importAt: sourceFilePath,
          exportFrom: moduleSourceFilePath,
          relativePath,
          importDeclarations: [
            {
              isDefaultExport: true,
              importModuleNameFrom: defaultImport.getText(),
              importModuleNameTo: appendPostfixHash(baseFilename, moduleHash),
              isPureType:
                defaultImportModuleType == null
                  ? false
                  : defaultImportModuleType.getKind() === SyntaxKind.TypeAliasDeclaration ||
                    defaultImportModuleType.getKind() === SyntaxKind.ClassDeclaration ||
                    defaultImportModuleType.getKind() === SyntaxKind.InterfaceDeclaration,
            },
          ],
        } satisfies IResolvedImportModule;
      }

      const importModuleType = atOrUndefined(declarationMap.get(typeNameWithImportDeclaration.textTypeName) ?? [], 0);

      return {
        isExternalLibraryImport: false,
        importAt: sourceFilePath,
        exportFrom: moduleSourceFilePath,
        hash: moduleHash,
        relativePath,
        importDeclarations: [
          {
            isDefaultExport: false,
            importModuleNameTo: typeNameWithImportDeclaration.textTypeName,
            importModuleNameFrom: typeNameWithImportDeclaration.textTypeName,
            isPureType:
              importModuleType == null
                ? false
                : importModuleType.getKind() === SyntaxKind.TypeAliasDeclaration ||
                  importModuleType.getKind() === SyntaxKind.ClassDeclaration ||
                  importModuleType.getKind() === SyntaxKind.InterfaceDeclaration,
          },
        ],
      } satisfies IResolvedImportModule;
    },
  );

  const resolutionRecord = nonDedupeResolutions.reduce<Record<string, IResolvedImportModule>>(
    (aggregation, current) => {
      const moduleInImports = aggregation[current.exportFrom];

      if (moduleInImports != null) {
        const concatedImportDeclarations: IResolvedImportModule['importDeclarations'] = [
          ...current.importDeclarations,
          ...moduleInImports.importDeclarations,
        ];

        concatedImportDeclarations.sort((left, right) => {
          if (left.isDefaultExport) {
            return 1;
          }

          if (right.isDefaultExport) {
            return -1;
          }

          return left.importModuleNameTo.localeCompare(right.importModuleNameTo);
        });

        return {
          ...aggregation,
          [current.exportFrom]: {
            ...moduleInImports,
            importDeclarations: concatedImportDeclarations,
          } satisfies IResolvedImportModule,
        } satisfies Record<string, IResolvedImportModule>;
      }

      return { ...aggregation, [current.exportFrom]: current } satisfies Record<string, IResolvedImportModule>;
    },
    {},
  );

  const resolutions = Object.values(resolutionRecord);

  return resolutions;
}
