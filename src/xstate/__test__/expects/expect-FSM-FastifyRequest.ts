import * as env from '#test-tools/env';
import posixJoin from '#tool/posixJoin';
import chalk from 'chalk';

export default {
  importBox: {
    [posixJoin(env.examplePath, 'handlers/get/interface/IReqPokeHello.ts')]: {
      hash: 'SynyPSafLHaoobLmnZXzP70l78QG5PfE',
      namedBindings: [],
      nonNamedBinding: 'IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE',
      nonNamedBindingIsPureType: true,
      importFile: posixJoin(env.examplePath, 'handlers/get/interface/IReqPokeHello.ts'),
    },
    [posixJoin(env.examplePath, 'handlers/get/justice/world.ts')]: {
      hash: '11CDWg9vT2mXPbskhyeSYs3VSVczUk5a',
      namedBindings: [{ alias: 'option_11CDWg9vT2mXPbskhyeSYs3VSVczUk5a', name: 'option', isPureType: false }],
      nonNamedBinding: 'world_11CDWg9vT2mXPbskhyeSYs3VSVczUk5a',
      importFile: posixJoin(env.examplePath, 'handlers/get/justice/world.ts'),
    },
  },
  routeBox: {
    [posixJoin(env.examplePath, 'handlers/get/justice/world.ts')]: {
      hash: '11CDWg9vT2mXPbskhyeSYs3VSVczUk5a',
      handlerName: 'world_11CDWg9vT2mXPbskhyeSYs3VSVczUk5a',
      hasOption: true,
      method: 'get',
      routePath: '/justice/world',
      sourceFilePath: posixJoin(env.examplePath, 'handlers/get/justice/world.ts'),
      typeArgument:
        "{\n      Querysting: IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE['querystring'];\n      Body: IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE['Body'];\n      Headers: {\n        'access-token': string;\n        'refresh-token': string;\n        'expire-time': {\n          token: string;\n          expire: number;\n          site: {\n            host: string;\n            port: number;\n          };\n        };\n      };\n    }",
    },
  },
  messages: [
    {
      type: 'warn',
      filePath: posixJoin(env.examplePath, 'handlers/get/justice/world.ts'),
      lineAndCharacter: {
        character: 16,
        line: 14,
      },
      message: `Do you want Querystring? "${chalk.yellow('Querysting')}" in source code`,
    },
  ],
};
