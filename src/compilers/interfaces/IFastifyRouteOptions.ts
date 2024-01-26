import type * as tsm from 'ts-morph';

export interface IFastifyRouteOptions {
  has: {
    option: boolean;
    methods: boolean;
    map: boolean;
  };

  node: {
    option?: tsm.Node;
    methods?: tsm.Node;
    map?: tsm.Node;
  };
}
