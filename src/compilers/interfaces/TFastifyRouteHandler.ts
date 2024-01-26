import type * as tsm from 'ts-morph';

interface IFastifyRouteHandler {
  /** 동기/비동기 함수 정보 */
  kind: 'async' | 'sync';

  /** 이름 */
  name: string;

  /** 경로 */
  path: string;
}

export type TFastifyRouteHandler =
  | (IFastifyRouteHandler & {
      /** 함수/ 화살표 함수 정보 */
      type: 'function';

      /** 실제 노드 정보 */
      node: tsm.FunctionDeclaration;
    })
  | (IFastifyRouteHandler & {
      /** 함수/ 화살표 함수 정보 */
      type: 'arrow';

      /** 실제 노드 정보 */
      node: tsm.ArrowFunction;
    });
