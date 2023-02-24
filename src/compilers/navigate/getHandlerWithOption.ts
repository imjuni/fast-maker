import type THandlerNode from '#compilers/interfaces/THandlerNode';
import getHandlerStatement from '#compilers/navigate/getHandlerStatement';
import getOptionStatement from '#compilers/navigate/getOptionStatement';
import type { SourceFile } from 'ts-morph';

/**
 * 파일에 선언된 http handler를 가져온다. async/sync 구분을 하고 function, arrow function을 구분한다
 *
 * Route handler get from sourceFile object. After collect information that async/sync and classify
 * function and arrow function
 * @param sourceFile TypeScript source file object, tsm.SourceFile object
 */
export default function getHandlerWithOption(sourceFile: SourceFile): THandlerNode[] {
  const declarationMap = sourceFile.getExportedDeclarations();
  const defaultExportedNodes = declarationMap.get('default');
  const optionNamedExportedNodes = declarationMap.get('option');

  const nodes = [getOptionStatement(optionNamedExportedNodes), getHandlerStatement(defaultExportedNodes)].filter(
    (node): node is THandlerNode => node != null,
  );

  return nodes;
}
