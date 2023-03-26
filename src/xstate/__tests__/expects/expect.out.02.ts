import * as env from '#tools/__tests__/tools/env';
import posixJoin from '#tools/posixJoin';

export default {
  messages: [
    {
      type: 'warn',
      filePath: posixJoin(env.handlerPath, 'get/justice/world.ts'),
      lineAndCharacter: {
        line: 14,
        character: 16,
      },
    },
  ],
  importBox: {
    [posixJoin(env.handlerPath, 'get/justice/world.ts')]: {
      hash: 'Ua8WhawDaNixVgbF2am4uJt9QPFcfmcd',
      namedBindings: [
        {
          name: 'option',
          alias: 'option_Ua8WhawDaNixVgbF2am4uJt9QPFcfmcd',
          isPureType: false,
        },
      ],
      nonNamedBinding: 'world_Ua8WhawDaNixVgbF2am4uJt9QPFcfmcd',
      importFile: posixJoin(env.handlerPath, 'get/justice/world.ts'),
    },
    [posixJoin(env.handlerPath, 'get/interface/IReqPokeHello.ts')]: {
      hash: 'WmVgDXZ194bvrxejXgJFPX1JL5Qkf37W',
      namedBindings: [],
      nonNamedBinding: 'IReqPokeHello_WmVgDXZ194bvrxejXgJFPX1JL5Qkf37W',
      nonNamedBindingIsPureType: true,
      importFile: posixJoin(env.handlerPath, 'get/interface/IReqPokeHello.ts'),
    },
  },
  routeBox: {
    [posixJoin(env.handlerPath, 'get/justice/world.ts')]: {
      hash: 'Ua8WhawDaNixVgbF2am4uJt9QPFcfmcd',
      hasOption: true,
      method: 'get',
      routePath: '/justice/world',
      handlerName: 'world_Ua8WhawDaNixVgbF2am4uJt9QPFcfmcd',
      sourceFilePath: posixJoin(env.handlerPath, 'get/justice/world.ts'),
      typeArgument:
        "{\n      Querysting: IReqPokeHello_WmVgDXZ194bvrxejXgJFPX1JL5Qkf37W['querystring'];\n      Body: IReqPokeHello_WmVgDXZ194bvrxejXgJFPX1JL5Qkf37W['Body'];\n      Headers: {\n        'access-token': string;\n        'refresh-token': string;\n        'expire-time': {\n          token: string;\n          expire: number;\n          site: {\n            host: string;\n            port: number;\n          };\n        };\n      };\n    }",
    },
  },
};
