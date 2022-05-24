export default interface IGetModuleInImports {
  isExternalLibraryImport: boolean;
  importAt: string;
  exportFrom: string;
  hash: string;
  importDeclarations: Array<{
    isDefaultExport: boolean;
    importModuleNameFrom: string;
    importModuleNameTo: string;
  }>;
}
