import posixJoin from '#tools/posixJoin';
import * as env from '#tools/__tests__/env';
import chalk from 'chalk';

export default {
  importBox: {
    [posixJoin(env.handlerPath, 'get', 'xman', 'world.ts')]: {
      hash: 'iPqtyy3O9gadgTB4BDs0ZmQLsyn16Snt',
      namedBindings: [],
      nonNamedBinding: 'world_iPqtyy3O9gadgTB4BDs0ZmQLsyn16Snt',
      importFile: posixJoin(env.handlerPath, 'get', 'xman', 'world.ts'),
    },
    [posixJoin(env.handlerPath, 'get', 'interface', 'IReqPokeHello.ts')]: {
      hash: 'SynyPSafLHaoobLmnZXzP70l78QG5PfE',
      namedBindings: [],
      nonNamedBinding: 'IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE',
      nonNamedBindingIsPureType: true,
      importFile: posixJoin(env.handlerPath, 'get', 'interface', 'IReqPokeHello.ts'),
    },
    [posixJoin(env.examplePath, 'interface', 'TAbnormalPresident.ts')]: {
      hash: 'DS8Pg2MYm5AsqoJVltiuqlOctGQfT78w',
      namedBindings: [],
      nonNamedBinding: 'TAbnormalPresident_DS8Pg2MYm5AsqoJVltiuqlOctGQfT78w',
      nonNamedBindingIsPureType: true,
      importFile: posixJoin(env.examplePath, 'interface', 'TAbnormalPresident.ts'),
    },
    [posixJoin(env.examplePath, 'interface', 'ICompany.ts')]: {
      hash: '6bwarMss36QHeqUXTVMxB9uAjEjVZOL1',
      namedBindings: [],
      nonNamedBinding: 'ICompany_6bwarMss36QHeqUXTVMxB9uAjEjVZOL1',
      nonNamedBindingIsPureType: true,
      importFile: posixJoin(env.examplePath, 'interface', 'ICompany.ts'),
    },
    [posixJoin(env.examplePath, 'interface', 'IAbility.ts')]: {
      hash: 'FaJPXXq2KiAC6EVDBL3aeh4ER262pWhl',
      namedBindings: [
        {
          name: 'IAbility',
          alias: 'IAbility',
          isPureType: true,
        },
      ],
      importFile: posixJoin(env.examplePath, 'interface', 'IAbility.ts'),
    },
  },
  routeBox: {
    [posixJoin(env.handlerPath, 'get', 'xman', 'world.ts')]: {
      hash: 'iPqtyy3O9gadgTB4BDs0ZmQLsyn16Snt',
      hasOption: false,
      method: 'get',
      routePath: '/xman/world',
      handlerName: 'world_iPqtyy3O9gadgTB4BDs0ZmQLsyn16Snt',
      sourceFilePath: posixJoin(env.handlerPath, 'get', 'xman', 'world.ts'),
      typeArgument:
        "{\n    querystring: IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE['querystring'];\n    Body:\n      | IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE['Body']\n      | {\n          help: TAbnormalPresident_DS8Pg2MYm5AsqoJVltiuqlOctGQfT78w;\n          company: ICompany_6bwarMss36QHeqUXTVMxB9uAjEjVZOL1;\n          ability: IAbility;\n        };\n    Headers: {\n      'access-token': string;\n      'refresh-token': string;\n      kind: { name: 'develop' } & { name: 'prod' } & { name: ICompany_6bwarMss36QHeqUXTVMxB9uAjEjVZOL1 };\n      'expire-time': {\n        token: string | number | boolean;\n        expire: number;\n        site: {\n          host: string;\n          port: number;\n        };\n      };\n    };\n  }",
    },
  },
  messages: [
    {
      type: 'warn',
      filePath: posixJoin(env.handlerPath, 'get', 'xman/world.ts'),
      lineAndCharacter: {
        line: 7,
        character: 1,
      },
      message: `Do you want Querystring? "${chalk.yellow('querystring')}" in source code`,
    },
  ],
};
