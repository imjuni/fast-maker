import { isNotEmpty } from 'my-easy-fp';
import * as tsm from 'ts-morph';

interface IValidatePropertySignatureParam {
  source: tsm.SourceFile;
  typeReferenceNodes: tsm.TypeReferenceNode[];
}

interface IValidateTypeReferencesReturn {
  valid: boolean;

  typeAliases: {
    total: tsm.TypeAliasDeclaration[];
    exported: tsm.TypeAliasDeclaration[];
  };
  interfaces: {
    total: tsm.InterfaceDeclaration[];
    exported: tsm.InterfaceDeclaration[];
  };

  classes: {
    total: tsm.ClassDeclaration[];
    exported: tsm.ClassDeclaration[];
  };
}

export default function validateTypeReferences({
  source,
  typeReferenceNodes,
}: IValidatePropertySignatureParam): IValidateTypeReferencesReturn {
  const typeAliases = source.getTypeAliases();
  const interfaces = source.getInterfaces();
  const classes = source.getClasses();

  if (typeAliases.length === 0 && interfaces.length === 0 && classes.length === 0) {
    return {
      valid: true,
      typeAliases: { total: [], exported: [] },
      interfaces: { total: [], exported: [] },
      classes: { total: [], exported: [] },
    };
  }

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

  return {
    valid:
      matchAndExportedInTypeAliases.length > 0 ||
      matchAndExportedInterfaces.length > 0 ||
      matchAndExportedClasses.length > 0,

    typeAliases: {
      total: matchedTypeAliases,
      exported: matchAndExportedInTypeAliases,
    },

    interfaces: {
      total: matchedInterfaces,
      exported: matchAndExportedInterfaces,
    },

    classes: {
      total: matchedClasses,
      exported: matchAndExportedClasses,
    },
  };
}
