export interface IResolvedImportModule {
  /** 외부 모듈인지 나타낸다 */
  isExternalLibraryImport: boolean;
  /** 이 모듈을 import 한 파일 */
  importAt: string;
  /** 이 모듈이 export 된 파일 */
  exportFrom: string;
  /** 라우팅 설정 파일을 저장할 디렉토리와 이 모듈이 export 된 파일의 상대 경로를 사용해 생성한 해시 */
  hash: string;
  /** hash를 생성할 때 사용한 상대 경로 */
  relativePath: string;
  importDeclarations: {
    /** default export 인가 */
    isDefaultExport: boolean;
    /** export 할 때 이름, alias 적용 전 */
    importModuleNameFrom: string;
    /** import 할 때 이름, alias 적용 후 */
    importModuleNameTo: string;
    /** 순수 타입이라면 type 키워드를 추가하기 위해 true 설정 */
    isPureType: boolean;
  }[];
}
