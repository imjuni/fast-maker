export interface IImportConfiguration {
  /**
   * hash 난수로 생성한다
   */
  hash: string;

  /**
   * namedBinding 이름 목록
   */
  namedBindings: {
    name: string;
    alias: string;
    isPureType: boolean;
  }[];

  /**
   * binding 이름
   */
  nonNamedBinding?: string;
  nonNamedBindingIsPureType?: boolean;

  /**
   * import 할 파일의 경로
   */
  importFile: string;

  /** import statement를 작성할 때 사용할 상대 경로 */
  relativePath: string;

  /** 소스파일 */
  // source: SourceFile;
}
