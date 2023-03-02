export default interface IImportConfiguration {
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

  /** 소스파일 */
  // source: SourceFile;
}
