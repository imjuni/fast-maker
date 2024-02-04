import type { IResolvedImportModule } from '#/compilers/interfaces/IResolvedImportModule';
import { getTypeSymbolText } from '#/compilers/tools/getTypeSymbolText';
import type { IBaseOption } from '#/configs/interfaces/IBaseOption';
import { appendPostfixHash } from '#/tools/appendPostfixHash';
import { getHash } from '#/tools/getHash';
import { getRelativeModulePath } from '#/tools/getRelativeModulePath';
import { removeHandlerPath } from '#/tools/removeHandlerPath';
import type * as tsm from 'ts-morph';

interface IGetLocalModuleInImports {
  sourceFile: tsm.SourceFile;
  options: { output: IBaseOption['output']; extKind: IBaseOption['extKind'] };
  typeReferenceNodes: tsm.TypeReferenceNode[];
}

/**
 * 이 파일은 in-file, import statements를 정리한다
 */
export function getResolvedInFileImportedModules({
  sourceFile,
  options,
  typeReferenceNodes,
}: IGetLocalModuleInImports): IResolvedImportModule[] {
  const typeAliases = sourceFile.getTypeAliases();
  const interfaces = sourceFile.getInterfaces();
  const classes = sourceFile.getClasses();

  const typeNames = typeReferenceNodes.map((typeReferenceNode) => typeReferenceNode.getTypeName().getText());

  const moduleSourceFilePath = sourceFile.getFilePath().toString();
  const relativeFilePath = removeHandlerPath(moduleSourceFilePath, options.output);
  const moduleHash = getHash(relativeFilePath);

  const matchedTypeAliases = typeAliases.filter((typeAlias) => typeNames.includes(typeAlias.getName()));
  const matchAndExportedInTypeAliases = matchedTypeAliases.filter((typeAlias) => typeAlias.isExported());

  const matchedInterfaces = interfaces.filter((interfaceNode) => typeNames.includes(interfaceNode.getName()));
  const matchAndExportedInterfaces = matchedInterfaces.filter((interfaceNode) => interfaceNode.isExported());

  const matchedClasses = classes.filter((classNode) => {
    const name = classNode.getName();
    return name != null && typeNames.includes(name);
  });
  const matchAndExportedClasses = matchedClasses.filter((classNode) => classNode.isExported());
  const relativePath = getRelativeModulePath({
    modulePath: moduleSourceFilePath,
    output: options.output,
    extKind: options.extKind,
  });

  // local export는 default export 일 수 없다. default export는 route handler function 전용으로
  // 제한되어 있기 때문이다
  const importCodeBases = [
    matchAndExportedInTypeAliases.map<IResolvedImportModule>((typeAlias) => {
      const moduleName = getTypeSymbolText(typeAlias.getType(), (node) =>
        node.getType().getAliasSymbolOrThrow().getEscapedName(),
      );

      return {
        isExternalModuleImport: false,
        isLocalModuleImport: true,
        hash: moduleHash,
        importAt: moduleSourceFilePath,
        exportFrom: moduleSourceFilePath,
        relativePath,
        importDeclarations: [
          {
            isDefaultExport: false,
            importModuleNameFrom: moduleName,
            importModuleNameTo: appendPostfixHash(moduleName, moduleHash),
            isPureType: true,
          },
        ],
      };
    }),
    matchAndExportedInterfaces.map<IResolvedImportModule>((interfaceNode) => {
      const moduleName = getTypeSymbolText(interfaceNode.getType(), (node) =>
        node.getType().getSymbolOrThrow().getEscapedName(),
      );

      return {
        isExternalModuleImport: false,
        isLocalModuleImport: true,
        hash: moduleHash,
        importAt: moduleSourceFilePath,
        exportFrom: moduleSourceFilePath,
        relativePath,
        importDeclarations: [
          {
            isDefaultExport: false,
            importModuleNameFrom: moduleName,
            importModuleNameTo: appendPostfixHash(moduleName, moduleHash),
            isPureType: true,
          },
        ],
      };
    }),

    matchAndExportedClasses.map<IResolvedImportModule>((classNode) => {
      const moduleName = getTypeSymbolText(classNode.getType(), (node) =>
        node.getType().getSymbolOrThrow().getEscapedName(),
      );

      return {
        isExternalModuleImport: false,
        isLocalModuleImport: true,
        hash: moduleHash,
        importAt: moduleSourceFilePath,
        exportFrom: moduleSourceFilePath,
        relativePath,
        importDeclarations: [
          {
            isDefaultExport: false,
            importModuleNameFrom: moduleName,
            importModuleNameTo: appendPostfixHash(moduleName, moduleHash),
            isPureType: true,
          },
        ],
      };
    }),
  ].flat();

  return importCodeBases;
}
