import type { IRouteConfiguration } from '#/routes/interfaces/IRouteConfiguration';
import { sortRoutePath } from '#/routes/sort/sortRoutePath';
import { describe, expect, it } from 'vitest';

const routings: IRouteConfiguration[] = [
  {
    methods: ['get'],
    routePath: '/',
    hash: 'jjaZTV7G4bZewxbekhbGVgAfZRoDcCBP',
    hasOption: false,
    handlerName: 'handler_jjaZTV7G4bZewxbekhbGVgAfZRoDcCBP',
    typeArgument: {
      request: 'property-signature',
      text: '',
    },
    sourceFilePath: '/Users/imjuni/project/github/fast-maker/examples/handlers/get.ts',
  },
  {
    methods: ['get'],
    routePath: '/avengers/heroes/:id',
    hash: 'E6sTFTY5HVG6ZoiyOfO78twMQtegfNKM',
    hasOption: false,
    handlerName: 'handler_E6sTFTY5HVG6ZoiyOfO78twMQtegfNKM',
    typeArgument: {
      request: 'fastify-request',
      kind: 187,
      text: '{ Body: IAbility }',
    },
    sourceFilePath: '/Users/imjuni/project/github/fast-maker/examples/handlers/avengers/heroes/[id]/get.ts',
  },
  {
    methods: ['put', 'patch'],
    routePath: '/avengers/heroes/:id',
    hash: 'JcsG7kAN9Rhl7Bj66sC4AJjcG81hc0o7',
    hasOption: false,
    handlerName: 'handler_JcsG7kAN9Rhl7Bj66sC4AJjcG81hc0o7',
    typeArgument: {
      request: 'property-signature',
      text: '',
    },
    sourceFilePath: '/Users/imjuni/project/github/fast-maker/examples/handlers/avengers/heroes/[id]/put.ts',
  },
  {
    methods: ['get', 'search'],
    routePath: '/avengers/heroes',
    hash: 'RKQsowJ59rvtTzit3ceAu0YOnIOLK4ZH',
    hasOption: false,
    handlerName: 'handler_RKQsowJ59rvtTzit3ceAu0YOnIOLK4ZH',
    typeArgument: {
      request: 'property-signature',
      text: '',
    },
    sourceFilePath: '/Users/imjuni/project/github/fast-maker/examples/handlers/avengers/heroes/get.ts',
  },
  {
    methods: ['post'],
    routePath: '/avengers/heroes',
    hash: 'PyYwrekj8FU77SIYAcghL29WTKosRRP0',
    hasOption: false,
    handlerName: 'handler_PyYwrekj8FU77SIYAcghL29WTKosRRP0',
    typeArgument: {
      request: 'property-signature',
      text: '',
    },
    sourceFilePath: '/Users/imjuni/project/github/fast-maker/examples/handlers/avengers/heroes/post.ts',
  },
  {
    methods: ['get', 'search'],
    routePath: '/avengers/heroes/:id?',
    hash: 'dIptpGuAKFzf0qeTAHtzx2eULDtPLFdB',
    hasOption: false,
    handlerName: 'handler_dIptpGuAKFzf0qeTAHtzx2eULDtPLFdB',
    typeArgument: {
      request: 'property-signature',
      text: '',
    },
    sourceFilePath: '/Users/imjuni/project/github/fast-maker/examples/handlers/avengers/heroes/[[id]]/get.ts',
  },
  {
    methods: ['post'],
    routePath: '/avengers/heroes/:id/:hour(^\\d{2})h:minute(^\\d{2})m',
    hash: 'r4PZQn5zGL7qwViJ1L07z1WK9sbfNLFK',
    hasOption: false,
    handlerName: 'handler_r4PZQn5zGL7qwViJ1L07z1WK9sbfNLFK',
    typeArgument: {
      request: 'fastify-request',
      kind: 187,
      text: '{ Body: IAbility }',
    },
    sourceFilePath: '/Users/imjuni/project/github/fast-maker/examples/handlers/avengers/heroes/[id]/[$time]/post.ts',
  },
  {
    methods: ['delete'],
    routePath: '/hello',
    hash: 'DggTo0LTLK8Hpxjtd4DZ2DL2WkuKa9pL',
    hasOption: false,
    handlerName: 'handler_DggTo0LTLK8Hpxjtd4DZ2DL2WkuKa9pL',
    typeArgument: {
      request: 'property-signature',
      text: '',
    },
    sourceFilePath: '/Users/imjuni/project/github/fast-maker/examples/handlers/hello/delete.ts',
  },
  {
    methods: ['post'],
    routePath: '/hello',
    hash: 'yMyTHNwiACuaCaoPmXsAMsWdfIhWMJCS',
    hasOption: false,
    handlerName: 'handler_yMyTHNwiACuaCaoPmXsAMsWdfIhWMJCS',
    typeArgument: {
      request: 'property-signature',
      text: '',
    },
    sourceFilePath: '/Users/imjuni/project/github/fast-maker/examples/handlers/hello/post.ts',
  },
  {
    methods: ['put'],
    routePath: '/hello',
    hash: 'qFaWzYBLA8Du9hWEGQsjrEPqLbauwjQN',
    hasOption: false,
    handlerName: 'handler_qFaWzYBLA8Du9hWEGQsjrEPqLbauwjQN',
    typeArgument: {
      request: 'property-signature',
      text: '',
    },
    sourceFilePath: '/Users/imjuni/project/github/fast-maker/examples/handlers/hello/put.ts',
  },
  {
    methods: ['get'],
    routePath: '/po-ke/world',
    hash: 'm7vOoboyWbScOSEpWeCimw2qbMtNNrSc',
    hasOption: true,
    handlerName: 'handler_m7vOoboyWbScOSEpWeCimw2qbMtNNrSc',
    typeArgument: {
      request: 'fastify-request',
      kind: 187,
      text: "{\n      Querystring: IReqPokeHello['querystring'];\n      Body: IReqPokeHello['Body'];\n      Headers: {\n        'access-token': string;\n        'refresh-token': string;\n        'expire-time': {\n          token: string;\n          expire: number;\n          site: {\n            host: string;\n            port: number;\n          };\n        };\n      };\n    }",
    },
    sourceFilePath: '/Users/imjuni/project/github/fast-maker/examples/handlers/po-ke/world/get.ts',
  },
];

describe('sortRoutePath', () => {
  it('sorting', () => {
    const sorted = sortRoutePath(routings);
    const routePaths = sorted.map((route) => `${route.methods.join(', ')}-${route.routePath}`);

    expect(routePaths).toEqual([
      'get-/',
      'get-/avengers/heroes/:id',
      'put, patch-/avengers/heroes/:id',
      'get, search-/avengers/heroes',
      'post-/avengers/heroes',
      'get, search-/avengers/heroes/:id?',
      'post-/avengers/heroes/:id/:hour(^\\d{2})h:minute(^\\d{2})m',
      'delete-/hello',
      'post-/hello',
      'put-/hello',
      'get-/po-ke/world',
    ]);
  });
});
