import * as env from '#tools/__tests__/tools/env';
import posixJoin from '#tools/posixJoin';

export default {
  messages: [
    {
      type: 'warn',
      filePath: posixJoin(env.handlerPath, 'get', 'po-ke', 'c3.ts'),
      lineAndCharacter: {
        line: 15,
        character: 7,
      },
    },
  ],
  importBox: {
    [posixJoin(env.handlerPath, 'get', 'po-ke', 'c3.ts')]: {
      hash: 'T7YIOeRjzkGBhbzT3zhqBAvkdMT6bqO6',
      namedBindings: [
        {
          name: 'option',
          alias: 'option_T7YIOeRjzkGBhbzT3zhqBAvkdMT6bqO6',
          isPureType: false,
        },
      ],
      nonNamedBinding: 'world_T7YIOeRjzkGBhbzT3zhqBAvkdMT6bqO6',
      importFile: posixJoin(env.handlerPath, 'get', 'po-ke', 'c3.ts'),
    },
    [posixJoin(env.handlerPath, 'get', 'interface', 'IReqPokeHello.ts')]: {
      hash: 'WmVgDXZ194bvrxejXgJFPX1JL5Qkf37W',
      namedBindings: [],
      nonNamedBinding: 'IReqPokeHello_WmVgDXZ194bvrxejXgJFPX1JL5Qkf37W',
      nonNamedBindingIsPureType: true,
      importFile: posixJoin(env.handlerPath, 'get', 'interface', 'IReqPokeHello.ts'),
    },
  },
  routeBox: {
    [posixJoin(env.handlerPath, 'get', 'po-ke', 'c3.ts')]: {
      hash: 'T7YIOeRjzkGBhbzT3zhqBAvkdMT6bqO6',
      hasOption: true,
      method: 'get',
      routePath: '/po-ke/c3',
      handlerName: 'world_T7YIOeRjzkGBhbzT3zhqBAvkdMT6bqO6',
      sourceFilePath: posixJoin(env.handlerPath, 'get', 'po-ke', 'c3.ts'),
      typeArgument:
        "{ Querstring: IReqPokeHello_WmVgDXZ194bvrxejXgJFPX1JL5Qkf37W['querystring']; Body: IReqPokeHello_WmVgDXZ194bvrxejXgJFPX1JL5Qkf37W['Body']; }",
    },
  },
};
