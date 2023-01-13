import type {
  ClassDeclaration,
  InterfaceDeclaration,
  SourceFile,
  TypeAliasDeclaration,
  TypeReferenceNode,
} from 'ts-morph';

interface IValidatePropertySignatureParam {
  source: SourceFile;
  typeReferenceNodes: TypeReferenceNode[];
}

interface IValidateTypeReferencesReturn {
  valid: boolean;

  typeAliases: {
    total: TypeAliasDeclaration[];
    exported: TypeAliasDeclaration[];
  };
  interfaces: {
    total: InterfaceDeclaration[];
    exported: InterfaceDeclaration[];
  };

  classes: {
    total: ClassDeclaration[];
    exported: ClassDeclaration[];
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
    return name != null && typeNames.includes(name);
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
