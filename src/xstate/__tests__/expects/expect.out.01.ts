import * as env from '#/tools/__tests__/tools/env';
import posixJoin from '#/tools/posixJoin';

// t001-FSM-TypeLiteral
export default {
  messages: [
    {
      type: 'warn',
      filePath: posixJoin(env.handlerPath, 'get/xman/world.ts'),
      lineAndCharacter: {
        line: 7,
        character: 1,
      },
    },
  ],
  importBox: {
    [posixJoin(env.handlerPath, 'get/xman/world.ts')]: {
      hash: 'T6h0XVQhU3SHYVi61Tv3RN9NTig7oSjB',
      namedBindings: [],
      nonNamedBinding: 'world_T6h0XVQhU3SHYVi61Tv3RN9NTig7oSjB',
      importFile: posixJoin(env.handlerPath, 'get/xman/world.ts'),
    },
    [posixJoin(env.handlerPath, 'get/interface/IReqPokeHello.ts')]: {
      hash: 'WmVgDXZ194bvrxejXgJFPX1JL5Qkf37W',
      namedBindings: [],
      nonNamedBinding: 'IReqPokeHello_WmVgDXZ194bvrxejXgJFPX1JL5Qkf37W',
      nonNamedBindingIsPureType: true,
      importFile: posixJoin(env.handlerPath, 'get/interface/IReqPokeHello.ts'),
    },
    [posixJoin(env.examplePath, 'interface/TAbnormalPresident.ts')]: {
      hash: 'kIigQATMBuUb5dEGoPYnJWz2tefe5X1R',
      namedBindings: [],
      nonNamedBinding: 'TAbnormalPresident_kIigQATMBuUb5dEGoPYnJWz2tefe5X1R',
      nonNamedBindingIsPureType: true,
      importFile: posixJoin(env.examplePath, 'interface/TAbnormalPresident.ts'),
    },
    [posixJoin(env.examplePath, 'interface/ICompany.ts')]: {
      hash: '3bY8q1ZakXkNeU55zUWSmASLcYbgGz0c',
      namedBindings: [],
      nonNamedBinding: 'ICompany_3bY8q1ZakXkNeU55zUWSmASLcYbgGz0c',
      nonNamedBindingIsPureType: true,
      importFile: posixJoin(env.examplePath, 'interface/ICompany.ts'),
    },
    [posixJoin(env.examplePath, 'interface/IAbility.ts')]: {
      hash: 'jvyjnGiyv4C0QldjsQAnI7kLzWP2Vy4i',
      namedBindings: [
        {
          name: 'IAbility',
          alias: 'IAbility',
          isPureType: true,
        },
      ],
      importFile: posixJoin(env.examplePath, 'interface/IAbility.ts'),
    },
  },
  routeBox: {
    [posixJoin(env.handlerPath, 'get/xman/world.ts')]: {
      hash: 'T6h0XVQhU3SHYVi61Tv3RN9NTig7oSjB',
      hasOption: false,
      method: 'get',
      routePath: '/xman/world',
      handlerName: 'world_T6h0XVQhU3SHYVi61Tv3RN9NTig7oSjB',
      sourceFilePath: posixJoin(env.handlerPath, 'get/xman/world.ts'),
      typeArgument:
        "{\n    querystring: IReqPokeHello_WmVgDXZ194bvrxejXgJFPX1JL5Qkf37W['querystring'];\n    Body:\n      | IReqPokeHello_WmVgDXZ194bvrxejXgJFPX1JL5Qkf37W['Body']\n      | {\n          help: TAbnormalPresident_kIigQATMBuUb5dEGoPYnJWz2tefe5X1R;\n          company: ICompany_3bY8q1ZakXkNeU55zUWSmASLcYbgGz0c;\n          ability: IAbility;\n        };\n    Headers: {\n      'access-token': string;\n      'refresh-token': string;\n      kind: { name: 'develop' } & { name: 'prod' } & { name: ICompany_3bY8q1ZakXkNeU55zUWSmASLcYbgGz0c };\n      'expire-time': {\n        token: string | number | boolean;\n        expire: number;\n        site: {\n          host: string;\n          port: number;\n        };\n      };\n    };\n  }",
    },
  },
};
