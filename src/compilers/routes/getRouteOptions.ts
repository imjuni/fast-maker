import type { IFastifyRouteOptions } from '#/compilers/interfaces/IFastifyRouteOptions';
import { getRouteOptionVariable } from '#/compilers/routes/getRouteOptionVariable';
import * as tsm from 'ts-morph';

export function getRouteOptions(sourceFile: tsm.SourceFile): IFastifyRouteOptions {
  const declarationMap = sourceFile.getExportedDeclarations();

  // options은 options이 있는지 없는지 확인만 하면 된다
  const option = getRouteOptionVariable(sourceFile);

  // methods는 methods가 있는지 없는지 확인만 하면 된다. 실제로는 getExtraMethods 함수를 사용해서
  // 내용을 읽고, 내용이 올바른지 확인한 뒤 사용할 것이라서 존재 여부만 확인하면 된다
  const methods = declarationMap.get('methods');

  // map은 map이 있는지 없는지 확인만 하면 된다. 실제로는 getRouteMap 함수를 사용해서
  // 내용을 읽고, 내용이 올바른지 확인한 뒤 사용할 것이라서 존재 여부만 확인하면 된다
  const map = declarationMap.get('map');

  return {
    has: {
      option: option != null,
      methods: methods != null,
      map: map != null,
    },
    node: {
      option,
      methods: methods?.filter((declaration) => declaration.getKind() === tsm.SyntaxKind.VariableDeclaration).at(0),
      map: map?.filter((declaration) => declaration.getKind() === tsm.SyntaxKind.VariableDeclaration).at(0),
    },
  };
}
