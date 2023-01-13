import type { SourceFile } from 'ts-morph';

export default interface IImportConfiguration {
  /**
   * hash 난수로 생성한다
   */
  hash: string;

  /**
   * namedBinding 이름 목록
   */
  namedBindings: Array<{
    name: string;
    alias: string;
  }>;

  /**
   * binding 이름
   */
  nonNamedBinding?: string;

  /**
   * import 할 파일의 경로
   */
  importFile: string;

  /** 소스파일 */
  source: SourceFile;
}
