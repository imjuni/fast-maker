import type IImportConfiguration from '#compilers/interfaces/IImportConfiguration';
import getTypeSymbolText from '#compilers/tools/getTypeSymbolText';
import type { SourceFile, TypeReferenceNode } from 'ts-morph';

interface IGetLocalExportStatementImport {
  source: SourceFile;
  hash: string;
  typeReferenceNodes: TypeReferenceNode[];
}

export default function getLocalExportStatementImport({
  source,
  hash,
  typeReferenceNodes,
}: IGetLocalExportStatementImport): IImportConfiguration[] {
  const typeAliases = source.getTypeAliases();
  const interfaces = source.getInterfaces();
  const classes = source.getClasses();

  const typeNames = typeReferenceNodes.map((typeReferenceNode) => typeReferenceNode.getTypeName().getText());

  const matchedTypeAliases = typeAliases.filter((typeAlias) => typeNames.includes(typeAlias.getName()));
  const matchAndExportedInTypeAliases = matchedTypeAliases.filter((typeAlias) => typeAlias.isExported());

  const matchedInterfaces = interfaces.filter((interfaceNode) => typeNames.includes(interfaceNode.getName()));
  const matchAndExportedInterfaces = matchedInterfaces.filter((interfaceNode) => interfaceNode.isExported());

  const matchedClasses = classes.filter((classNode) => {
    const name = classNode.getName();
    return name != null && typeNames.includes(name);
  });
  const matchAndExportedClasses = matchedClasses.filter((classNode) => classNode.isExported());

  const importCodeBases = [
    matchAndExportedInTypeAliases.map((typeAlias) => {
      const nodeName = getTypeSymbolText(typeAlias.getType(), (node) =>
        node.getType().getSymbolOrThrow().getEscapedName(),
      );
      const importCodeBase: IImportConfiguration = {
        hash,
        namedBindings: [
          {
            name: nodeName,
            alias: nodeName,
            isPureType: true,
          },
        ],
        importFile: source.getFilePath().toString(),
        // source,
      };

      return importCodeBase;
    }),
    matchAndExportedInterfaces.map((interfaceNode) => {
      const nodeName = getTypeSymbolText(interfaceNode.getType(), (node) =>
        node.getType().getSymbolOrThrow().getEscapedName(),
      );
      const importCodeBase: IImportConfiguration = {
        hash,
        namedBindings: [
          {
            name: nodeName,
            alias: nodeName,
            isPureType: true,
          },
        ],
        importFile: source.getFilePath().toString(),
        // source,
      };

      return importCodeBase;
    }),

    matchAndExportedClasses.map((classNode) => {
      const nodeName = getTypeSymbolText(classNode.getType(), (node) =>
        node.getType().getSymbolOrThrow().getEscapedName(),
      );
      const importCodeBase: IImportConfiguration = {
        hash,
        namedBindings: [
          {
            name: nodeName,
            alias: nodeName,
            isPureType: true,
          },
        ],
        importFile: source.getFilePath().toString(),
        // source,
      };

      return importCodeBase;
    }),
  ].flat();

  return importCodeBases;
}
