import IImportConfiguration from '@compiler/interface/IImportConfiguration';
import { isNotEmpty } from 'my-easy-fp';
import * as tsm from 'ts-morph';

interface IGetLocalExportStatementImport {
  source: tsm.SourceFile;
  hash: string;
  typeReferenceNodes: tsm.TypeReferenceNode[];
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
    return isNotEmpty(name) && typeNames.includes(name);
  });
  const matchAndExportedClasses = matchedClasses.filter((classNode) => classNode.isExported());

  const importCodeBases = [
    matchAndExportedInTypeAliases.map((typeAlias) => {
      const importCodeBase: IImportConfiguration = {
        hash,
        namedBindings: [typeAlias.getType().getText()],
        importFile: source.getFilePath().toString(),
        source,
      };

      return importCodeBase;
    }),
    matchAndExportedInterfaces.map((typeAlias) => {
      const importCodeBase: IImportConfiguration = {
        hash,
        namedBindings: [typeAlias.getType().getText()],
        importFile: source.getFilePath().toString(),
        source,
      };

      return importCodeBase;
    }),

    matchAndExportedClasses.map((typeAlias) => {
      const importCodeBase: IImportConfiguration = {
        hash,
        namedBindings: [typeAlias.getType().getText()],
        importFile: source.getFilePath().toString(),
        source,
      };

      return importCodeBase;
    }),
  ].flatMap((importCodeBase) => importCodeBase);

  return importCodeBases;
}
