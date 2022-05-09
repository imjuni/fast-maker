import ts from 'typescript';

/*
 * https://github.com/microsoft/TypeScript/blob/main/src/services/services.ts
 * https://github.com/microsoft/TypeScript/blob/1071240907ab7aae63ecc9c0bbde42aa51dc7669/src/services/services.ts#L15
 * https://github.com/microsoft/TypeScript/blob/1071240907ab7aae63ecc9c0bbde42aa51dc7669/src/services/services.ts#L657
 *
 * services/services 기준, SourceFileObject는 extends NodeObject하고 implements SourceFile 한다.
 * interface ISourceFileObject extends ts.SourceFile, ts.Node를 하는 경우 컴파일 오류가 발생하기 때문에
 * 아래와 같이 사용한다. 향후에는 services 내용도 공개를 하면 좋겠다.
 *
 * imports, identifiers, resolvedModules, getNamedDeclarations를 사용하지 않으면 symbol table을 직접 구현해야하며
 * 2 pass compiler를 구현해야 하기 때문에 아래 내용은 사용하는 것이 좋다.
 */
export default interface ISourceFileObject extends ts.SourceFile {
  imports: readonly ts.StringLiteralLike[];
  identifiers: Map<string, string>;

  // 이건 ModeAwareCache를 사용하는 것을 보면 아무래도 쓰면 안될 것 같기는 하다
  resolvedModules: ts.ModeAwareCache<ts.ResolvedModuleFull> | undefined;

  getNamedDeclarations(): Map<string, ts.Declaration[]>;
}
