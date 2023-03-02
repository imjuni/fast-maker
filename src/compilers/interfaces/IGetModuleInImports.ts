export default interface IGetModuleInImports {
  isExternalLibraryImport: boolean;
  importAt: string;
  exportFrom: string;
  hash: string;
  importDeclarations: {
    isDefaultExport: boolean;
    importModuleNameFrom: string;
    importModuleNameTo: string;
    isPureType: boolean;
  }[];
}
