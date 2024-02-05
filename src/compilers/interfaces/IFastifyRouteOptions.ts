import type { TFastifyRouteOption } from '#/compilers/interfaces/TFastifyRouteOption';
import type * as tsm from 'ts-morph';

export interface IFastifyRouteOptions {
  has: {
    option: boolean;
    methods: boolean;
    map: boolean;
  };

  node: {
    option?: TFastifyRouteOption;
    methods?: tsm.Node;
    map?: tsm.Node;
  };
}
