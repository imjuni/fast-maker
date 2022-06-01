import IReason from '@compiler/interface/IReason';
import { IHandlerStatement, IOptionStatement } from '@compiler/interface/THandlerNode';
import getHandlerWithOption from '@compiler/navigate/getHandlerWithOption';
import ErrorWithMessage from '@module/ErrorWithMessage';
import { IOption } from '@module/IOption';
import getRouteFiles from '@route/getRouteFiles';
import * as env from '@testenv/env';
import getHash from '@tool/getHash';
import getProcessedConfig from '@tool/getProcessedConfig';
import getTestValue from '@tool/getTestValue';
import posixJoin from '@tool/posixJoin';
import requestHandlerAnalysisMachine, {
  IContextRequestHandlerAnalysisMachine,
} from '@xstate/RequestHandlerAnalysisMachine';
import chalk from 'chalk';
import consola, { LogLevel } from 'consola';
import fastSafeStringify from 'fast-safe-stringify';
import 'jest';
import { isEmpty } from 'my-easy-fp';
import { replaceSepToPosix } from 'my-node-fp';
import { isFail } from 'my-only-either';
import path from 'path';
import * as tsm from 'ts-morph';
import { interpret } from 'xstate';

const share: { projectPath: string; project: tsm.Project; option: IOption } = {} as any;

beforeAll(async () => {
  share.projectPath = path.join(env.examplePath, 'tsconfig.json');

  const optionEither = await getProcessedConfig({
    args: {
      _: [],
      $0: 'route',
      project: share.projectPath,
      v: false,
      verbose: false,
      d: false,
      debugLog: false,
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

test('t001-RequestHandlerAnalysisMachine-TypeLiteral', async () => {
  const expectFileName = expect.getState().currentTestName.replace(/^([tT][0-9]+)(-.+)/, 'expect$2.ts');

  // project://example\handlers\get\justice\world.ts
  // project://example\handlers\get\xman\world.ts
  const routeFilePath = posixJoin(env.handlerPath, 'get', 'xman', 'world.ts');
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

  const expectation = await import(path.join(__dirname, 'expects', expectFileName));
  const terminateCircularResult = getTestValue(parsedDataBox);

  consola.debug(terminateCircularResult);

  expect(terminateCircularResult).toEqual(expectation.default);
});

test('RequestHandlerAnalysisMachine-FastifyRequest', async () => {
  // project://example\handlers\get\justice\world.ts
  // project://example\handlers\get\xman\world.ts
  const routeFilePath = posixJoin(env.handlerPath, 'get', 'justice', 'world.ts');
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

  const parsedDataBoxForTest = JSON.parse(
    fastSafeStringify(
      parsedDataBox,
      (_key, value) => {
        if (value === '[Circular]') {
          return undefined;
        }

        if (value instanceof tsm.Node) {
          return undefined;
        }

        return value;
      },
      2,
    ),
  );

  consola.debug(parsedDataBoxForTest);

  const expectation = {
    importBox: {
      [replaceSepToPosix(path.join(env.examplePath, 'handlers/get/interface/IReqPokeHello.ts'))]: {
        hash: 'SynyPSafLHaoobLmnZXzP70l78QG5PfE',
        namedBindings: [],
        nonNamedBinding: 'IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE',
        importFile: replaceSepToPosix(path.join(env.examplePath, 'handlers/get/interface/IReqPokeHello.ts')),
      },
      [replaceSepToPosix(path.join(env.examplePath, 'handlers/get/justice/world.ts'))]: {
        hash: 'um2VlboH9kiovJ4hoCH9ZVv6n3cm3OrV',
        namedBindings: [{ alias: 'option_um2VlboH9kiovJ4hoCH9ZVv6n3cm3OrV', name: 'option' }],
        nonNamedBinding: 'world_um2VlboH9kiovJ4hoCH9ZVv6n3cm3OrV',
        importFile: replaceSepToPosix(path.join(env.examplePath, 'handlers/get/justice/world.ts')),
      },
    },
    routeBox: {
      [replaceSepToPosix(path.join(env.examplePath, 'handlers/get/justice/world.ts'))]: {
        hash: 'um2VlboH9kiovJ4hoCH9ZVv6n3cm3OrV',
        handlerName: 'world_um2VlboH9kiovJ4hoCH9ZVv6n3cm3OrV',
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
