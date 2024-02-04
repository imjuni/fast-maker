import type { IResolvedImportModule } from '#/compilers/interfaces/IResolvedImportModule';
import { getNamedBindingName } from '#/compilers/tools/getNamedBindingName';
import { isExternalModule } from '#/compilers/type-tools/isExternalModule';
import { CE_EXT_KIND } from '#/configs/const-enum/CE_EXT_KIND';
import type { IBaseOption } from '#/configs/interfaces/IBaseOption';
import { getHash } from '#/tools/getHash';
import { getRelativeModulePath } from '#/tools/getRelativeModulePath';
import { removeQuote } from '#/tools/removeQuote';
import { atOrUndefined } from 'my-easy-fp';
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

  const typeNameWithImportDeclarations = data.imports
    .map((statement) => {
      const importClause = statement.getImportClauseOrThrow();
      const defaultImport = importClause.getDefaultImport();

      const namedBindings =
        defaultImport != null
          ? [defaultImport.getText(), ...getNamedBindingName(importClause.getNamedBindings())]
          : getNamedBindingName(importClause.getNamedBindings());

      return namedBindings.map((binding) => {
        return {
          isExternalModule: isExternalModule(statement),
          typeName: binding,
          importDeclaration: statement,
        };
      });
    })
    .flat()
    .filter((importStatement) => data.names.includes(importStatement.typeName));

  const nonDedupeResolutions = typeNameWithImportDeclarations.map<IResolvedImportModule>((importStatement) => {
    const importClause = importStatement.importDeclaration.getImportClauseOrThrow();
    const defaultImport = importClause.getDefaultImport();
    const sourceFilePath = importStatement.importDeclaration.getSourceFile().getFilePath();
    // node.js primitive type인 경우, SourceFile 객체를 가져올 수 없다
    // 예를들면, `import { Server } from 'http';`와 같이 http 모듈을 사용하는 경우가 이에 해당한다
    const moduleSourceFile = importStatement.importDeclaration.getModuleSpecifierSourceFile();

    if (moduleSourceFile == null) {
      return {
        isExternalModuleImport: importStatement.isExternalModule,
        isLocalModuleImport: false,
        hash: getHash(importStatement.typeName),
        importAt: sourceFilePath,
        exportFrom: importStatement.typeName,
        relativePath: removeQuote(
          importStatement.importDeclaration.getModuleSpecifier().getText() ?? importStatement.typeName,
        ),
        importDeclarations: [
          {
            isDefaultExport: defaultImport != null,
            ...(defaultImport != null
              ? {
                  importModuleNameFrom: defaultImport.getText(),
                  importModuleNameTo: defaultImport.getText(),
                }
              : {
                  importModuleNameTo: importStatement.typeName,
                  importModuleNameFrom: importStatement.typeName,
                }),
            isPureType: false,
          },
        ],
      };
    }

    // importStatement.importDeclaration.getModuleSpecifier().getText();
    const moduleSourceFilePath = moduleSourceFile.getFilePath();
    const declarationMap = moduleSourceFile.getExportedDeclarations();
    const relativePath = importStatement.isExternalModule
      ? removeQuote(importStatement.importDeclaration.getModuleSpecifier().getText() ?? importStatement.typeName)
      : getRelativeModulePath({
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
      const defaultImportModuleType = atOrUndefined(declarationMap.get('default') ?? [], 0);

      return {
        isExternalModuleImport: importStatement.isExternalModule,
        isLocalModuleImport: false,
        hash: moduleHash,
        importAt: sourceFilePath,
        exportFrom: moduleSourceFilePath,
        relativePath,
        importDeclarations: [
          {
            isDefaultExport: true,
            importModuleNameFrom: defaultImport.getText(),
            importModuleNameTo: defaultImport.getText(),
            isPureType:
              defaultImportModuleType == null
                ? false
                : defaultImportModuleType.getKind() === SyntaxKind.TypeAliasDeclaration ||
                  defaultImportModuleType.getKind() === SyntaxKind.ClassDeclaration ||
                  defaultImportModuleType.getKind() === SyntaxKind.InterfaceDeclaration,
          },
        ],
      };
    }

    const importModuleType = atOrUndefined(declarationMap.get(importStatement.typeName) ?? [], 0);

    return {
      isExternalModuleImport: importStatement.isExternalModule,
      isLocalModuleImport: false,
      hash: moduleHash,
      importAt: sourceFilePath,
      exportFrom: moduleSourceFilePath,
      relativePath,
      importDeclarations: [
        {
          isDefaultExport: false,
          importModuleNameTo: importStatement.typeName,
          importModuleNameFrom: importStatement.typeName,
          isPureType:
            importModuleType == null
              ? false
              : importModuleType.getKind() === SyntaxKind.TypeAliasDeclaration ||
                importModuleType.getKind() === SyntaxKind.ClassDeclaration ||
                importModuleType.getKind() === SyntaxKind.InterfaceDeclaration,
        },
      ],
    };
  });

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
