import IReason from '@compiler/interface/IReason';
import { IHandlerStatement, IOptionStatement } from '@compiler/interface/THandlerNode';
import getHandlerWithOption from '@compiler/navigate/getHandlerWithOption';
import ErrorWithMessage from '@module/ErrorWithMessage';
import { IOption } from '@module/IOption';
import getRouteFiles from '@route/getRouteFiles';
import * as env from '@testenv/env';
import getHash from '@tool/getHash';
import getProcessedConfig from '@tool/getProcessedConfig';
import requestHandlerAnalysisMachine, {
  IContextRequestHandlerAnalysisMachine,
} from '@xstate/RequestHandlerAnalysisMachine';
import chalk from 'chalk';
import consola, { LogLevel } from 'consola';
import 'jest';
import { isEmpty, typedkey } from 'my-easy-fp';
import { replaceSepToPosix } from 'my-node-fp';
import { isFail } from 'my-only-either';
import path from 'path';
import * as tsm from 'ts-morph';
import { interpret } from 'xstate';

const share: { projectPath: string; project: tsm.Project; option: IOption } = {} as any;

describe('statemachine-test', () => {
  beforeAll(async () => {
    share.projectPath = path.join(env.examplePath, 'tsconfig.json');

    const optionEither = await getProcessedConfig({
      args: {
        _: [],
        $0: 'route',
        project: share.projectPath,
        v: false,
        verbose: false,
        p: share.projectPath,
        h: env.handlerPath,
        handler: env.handlerPath,
        o: env.handlerPath,
        output: env.handlerPath,
      },
      project: share.projectPath,
    });

    if (isFail(optionEither)) {
      throw optionEither.fail;
    }

    consola.level = LogLevel.Debug;
    share.project = new tsm.Project({ tsConfigFilePath: share.projectPath });
    share.option = optionEither.pass;
  });

  test('RequestHandlerAnalysisMachine-TypeLiteral', async () => {
    // project://example\handlers\get\justice\world.ts
    // project://example\handlers\get\xman\world.ts
    const routeFilePath = replaceSepToPosix(path.join(env.handlerPath, 'get\\xman\\world.ts'));
    const source = share.project.getSourceFileOrThrow(routeFilePath);
    const handlerWithOption = getHandlerWithOption(source);
    const handler = handlerWithOption.find((node) => node.kind === 'handler');

    if (isEmpty(handler)) {
      throw new Error('invalid handler');
    }

    const routeHandlerFiles = await getRouteFiles(share.option.path.handler);
    const testRouteHandlerFile = routeHandlerFiles
      .filter((routeHandlerFile) => routeHandlerFile.method === 'get')
      .find((routeHandlerFile) => routeHandlerFile.filename === routeFilePath);

    if (isEmpty(testRouteHandlerFile)) {
      throw new Error(`Cannot create route handler configuration: ${routeFilePath}`);
    }

    const hash = getHash(source.getFilePath().toString());
    const nodes = getHandlerWithOption(source);
    const routeHandler = nodes.find((node): node is IHandlerStatement => node.kind === 'handler');
    const routeOption = nodes.find((node): node is IOptionStatement => node.kind === 'option');

    if (isEmpty(routeHandler)) {
      const reason: IReason = {
        type: 'error',
        filePath: source.getFilePath().toString(),
        source,
        message: `Cannot found route handler function: ${source.getFilePath().toString()}`,
      };

      throw new ErrorWithMessage(reason.message, reason);
    }

    const machine = requestHandlerAnalysisMachine({
      project: share.project,
      source,
      hash,
      routeHandler: testRouteHandlerFile,
      handler: routeHandler,
      routeOption,
      option: share.option,
    });

    const service = interpret(machine);

    const parsedDataBox = await new Promise<
      Pick<IContextRequestHandlerAnalysisMachine, 'importBox' | 'routeBox' | 'messages'>
    >((resolve) => {
      service.onDone((data) => resolve(data.data));
      service.start();
    });

    const parsedDataBoxForTest = parsedDataBox as any;

    typedkey(parsedDataBoxForTest.importBox).forEach((key) => {
      delete parsedDataBoxForTest.importBox[key].source;
    });

    typedkey(parsedDataBoxForTest.routeBox).forEach((key) => {
      delete parsedDataBoxForTest.routeBox[key].source;
    });

    consola.debug(parsedDataBoxForTest);

    const expectation = {
      importBox: {
        [replaceSepToPosix(path.join(env.examplePath, '/handlers/get/interface/IReqPokeHello.ts'))]: {
          hash: 'PE1DwRqh4vUUIJhlS5Ews8vPigisJ6Hw',
          namedBindings: [],
          nonNamedBinding: 'IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE',
          importFile: replaceSepToPosix(path.join(env.examplePath, '/handlers/get/interface/IReqPokeHello.ts')),
        },
        [replaceSepToPosix(path.join(env.examplePath, '/interface/TAbnormalPresident.ts'))]: {
          hash: 'PE1DwRqh4vUUIJhlS5Ews8vPigisJ6Hw',
          namedBindings: [],
          nonNamedBinding: 'TAbnormalPresident_DS8Pg2MYm5AsqoJVltiuqlOctGQfT78w',
          importFile: replaceSepToPosix(path.join(env.examplePath, '/interface/TAbnormalPresident.ts')),
        },
        [replaceSepToPosix(path.join(env.examplePath, '/interface/ICompany.ts'))]: {
          hash: 'PE1DwRqh4vUUIJhlS5Ews8vPigisJ6Hw',
          namedBindings: [],
          nonNamedBinding: 'ICompany_6bwarMss36QHeqUXTVMxB9uAjEjVZOL1',
          importFile: replaceSepToPosix(path.join(env.examplePath, '/interface/ICompany.ts')),
        },
        [replaceSepToPosix(path.join(env.examplePath, '/interface/IAbility.ts'))]: {
          hash: 'PE1DwRqh4vUUIJhlS5Ews8vPigisJ6Hw',
          namedBindings: ['IAbility'],
          nonNamedBinding: undefined,
          importFile: replaceSepToPosix(path.join(env.examplePath, '/interface/IAbility.ts')),
        },
        [replaceSepToPosix(path.join(env.examplePath, '/handlers/get/xman/world.ts'))]: {
          hash: 'PE1DwRqh4vUUIJhlS5Ews8vPigisJ6Hw',
          namedBindings: [],
          nonNamedBinding: 'world_PE1DwRqh4vUUIJhlS5Ews8vPigisJ6Hw',
          importFile: replaceSepToPosix(path.join(env.examplePath, '/handlers/get/xman/world.ts')),
        },
      },
      routeBox: {
        [replaceSepToPosix(path.join(env.examplePath, '/handlers/get/xman/world.ts'))]: {
          hash: 'PE1DwRqh4vUUIJhlS5Ews8vPigisJ6Hw',
          hasOption: false,
          method: 'get',
          routePath: '/xman/world',
          sourceFilePath: replaceSepToPosix(path.join(env.examplePath, '/handlers/get/xman/world.ts')),
          typeArgument: `{\n    query: IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE['querystring'];\n    body:\n      | IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE['Body']\n      | {\n          help: TAbnormalPresident_DS8Pg2MYm5AsqoJVltiuqlOctGQfT78w;\n          company: ICompany_6bwarMss36QHeqUXTVMxB9uAjEjVZOL1;\n          ability: IAbility;\n        };\n    headers: {\n      'access-token': string;\n      'refresh-token': string;\n      kind: { name: 'develop' } & { name: 'prod' } & { name: ICompany_6bwarMss36QHeqUXTVMxB9uAjEjVZOL1 };\n      'expire-time': {\n        token: string | number | boolean;\n        expire: number;\n        site: {\n          host: string;\n          port: number;\n        };\n      };\n    };\n  }`,
        },
      },
      messages: [],
    };

    expect(parsedDataBoxForTest).toEqual(expectation);
  });

  test('RequestHandlerAnalysisMachine-FastifyRequest', async () => {
    // project://example\handlers\get\justice\world.ts
    // project://example\handlers\get\xman\world.ts
    const routeFilePath = replaceSepToPosix(path.join(env.handlerPath, 'get\\justice\\world.ts'));
    const source = share.project.getSourceFileOrThrow(routeFilePath);
    const handlerWithOption = getHandlerWithOption(source);
    const handler = handlerWithOption.find((node) => node.kind === 'handler');

    if (isEmpty(handler)) {
      throw new Error('invalid handler');
    }

    const routeHandlerFiles = await getRouteFiles(share.option.path.handler);
    const testRouteHandlerFile = routeHandlerFiles
      .filter((routeHandlerFile) => routeHandlerFile.method === 'get')
      .find((routeHandlerFile) => routeHandlerFile.filename === routeFilePath);

    if (isEmpty(testRouteHandlerFile)) {
      throw new Error(`Cannot create route handler configuration: ${routeFilePath}`);
    }

    const hash = getHash(source.getFilePath().toString());
    const nodes = getHandlerWithOption(source);
    const routeHandler = nodes.find((node): node is IHandlerStatement => node.kind === 'handler');
    const routeOption = nodes.find((node): node is IOptionStatement => node.kind === 'option');

    if (isEmpty(routeHandler)) {
      const reason: IReason = {
        type: 'error',
        filePath: source.getFilePath().toString(),
        source,
        message: `Cannot found route handler function: ${source.getFilePath().toString()}`,
      };

      throw new ErrorWithMessage(reason.message, reason);
    }

    const machine = requestHandlerAnalysisMachine({
      project: share.project,
      source,
      hash,
      routeHandler: testRouteHandlerFile,
      handler: routeHandler,
      routeOption,
      option: share.option,
    });

    const service = interpret(machine);

    const parsedDataBox = await new Promise<
      Pick<IContextRequestHandlerAnalysisMachine, 'importBox' | 'routeBox' | 'messages'>
    >((resolve) => {
      service.onDone((data) => resolve(data.data));
      service.start();
    });

    const parsedDataBoxForTest = parsedDataBox as any;

    typedkey(parsedDataBoxForTest.importBox).forEach((key) => {
      delete parsedDataBoxForTest.importBox[key].source;
    });

    typedkey(parsedDataBoxForTest.routeBox).forEach((key) => {
      delete parsedDataBoxForTest.routeBox[key].source;
    });

    typedkey(parsedDataBoxForTest.messages).forEach((key) => {
      delete parsedDataBoxForTest.messages[key].source;
      delete parsedDataBoxForTest.messages[key].node;
    });

    consola.debug(parsedDataBoxForTest);

    const expectation = {
      importBox: {
        [replaceSepToPosix(path.join(env.examplePath, 'handlers/get/interface/IReqPokeHello.ts'))]: {
          hash: 'um2VlboH9kiovJ4hoCH9ZVv6n3cm3OrV',
          namedBindings: [],
          nonNamedBinding: 'IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE',
          importFile: replaceSepToPosix(path.join(env.examplePath, 'handlers/get/interface/IReqPokeHello.ts')),
        },
        [replaceSepToPosix(path.join(env.examplePath, 'handlers/get/justice/world.ts'))]: {
          hash: 'um2VlboH9kiovJ4hoCH9ZVv6n3cm3OrV',
          namedBindings: ['option as option_um2VlboH9kiovJ4hoCH9ZVv6n3cm3OrV'],
          nonNamedBinding: 'world_um2VlboH9kiovJ4hoCH9ZVv6n3cm3OrV',
          importFile: replaceSepToPosix(path.join(env.examplePath, 'handlers/get/justice/world.ts')),
        },
      },
      routeBox: {
        [replaceSepToPosix(path.join(env.examplePath, 'handlers/get/justice/world.ts'))]: {
          hash: 'um2VlboH9kiovJ4hoCH9ZVv6n3cm3OrV',
          hasOption: true,
          method: 'get',
          routePath: '/justice/world',
          sourceFilePath: replaceSepToPosix(path.join(env.examplePath, 'handlers/get/justice/world.ts')),
          typeArgument:
            "{\n      Querysting: IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE['querystring'];\n      Body: IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE['Body'];\n      Headers: {\n        'access-token': string;\n        'refresh-token': string;\n        'expire-time': {\n          token: string;\n          expire: number;\n          site: {\n            host: string;\n            port: number;\n          };\n        };\n      };\n    }",
        },
      },
      messages: [
        {
          type: 'warn',
          filePath: replaceSepToPosix(path.join(env.examplePath, 'handlers/get/justice/world.ts')),
          lineAndCharacter: {
            character: 16,
            line: 14,
          },
          message: `Do you want Querystring? "${chalk.yellow('Querysting')}" in source code`,
        },
      ],
    };

    expect(parsedDataBoxForTest).toEqual(expectation);
  });
});
