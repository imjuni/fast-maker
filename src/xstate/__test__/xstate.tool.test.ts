import IReason from '#compiler/interface/IReason';
import { IHandlerStatement, IOptionStatement } from '#compiler/interface/THandlerNode';
import getHandlerWithOption from '#compiler/navigate/getHandlerWithOption';
import IConfig from '#config/interface/IConfig';
import ErrorWithMessage from '#module/ErrorWithMessage';
import getRouteFiles from '#route/getRouteFiles';
import * as env from '#testenv/env';
import getHash from '#tool/getHash';
import getTestValue from '#tool/getTestValue';
import logger from '#tool/logger';
import posixJoin from '#tool/posixJoin';
import requestHandlerAnalysisMachine, {
  IContextRequestHandlerAnalysisMachine,
} from '#xstate/RequestHandlerAnalysisMachine';
import 'jest';
import { isEmpty } from 'my-easy-fp';
import { replaceSepToPosix } from 'my-node-fp';
import path from 'path';
import * as tsm from 'ts-morph';
import { interpret } from 'xstate';

const share: { projectPath: string; project: tsm.Project; option: IConfig } = {} as any;
const log = logger();

beforeAll(async () => {
  share.projectPath = path.join(env.examplePath, 'tsconfig.json');

  log.level = 'debug';
  share.project = new tsm.Project({ tsConfigFilePath: share.projectPath });
  share.option = {
    project: share.projectPath,
    v: false,
    verbose: false,
    debugLog: false,
    p: share.projectPath,
    h: env.handlerPath,
    handler: env.handlerPath,
    o: env.handlerPath,
    output: env.handlerPath,
    useDefaultExport: true,
    routeFunctionName: 'routing',
  };
});

test('t001-FSM-TypeLiteral', async () => {
  const expectFileName = expect.getState().currentTestName?.replace(/^([tT][0-9]+)(-.+)/, 'expect$2.ts') ?? 'N/A';

  // project://example\handlers\get\justice\world.ts
  // project://example\handlers\get\xman\world.ts
  const routeFilePath = posixJoin(env.handlerPath, 'get', 'xman', 'world.ts');
  const source = share.project.getSourceFileOrThrow(routeFilePath);
  const handlerWithOption = getHandlerWithOption(source);
  const handler = handlerWithOption.find((node) => node.kind === 'handler');

  if (isEmpty(handler)) {
    throw new Error('invalid handler');
  }

  const routeHandlerFiles = await getRouteFiles(share.option.handler);
  const testRouteHandlerFile = routeHandlerFiles
    .filter((routeHandlerFile) => routeHandlerFile.method === 'get')
    .find((routeHandlerFile) => routeHandlerFile.filename === routeFilePath);

  if (isEmpty(testRouteHandlerFile)) {
    throw new Error(`Cannot create route handler configuration: ${routeFilePath}`);
  }

  const hash = getHash(replaceSepToPosix(path.relative(env.examplePath, source.getFilePath().toString())));
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

  log.debug(terminateCircularResult);

  expect(terminateCircularResult).toEqual(expectation.default);
});

test('t002-FSM-FastifyRequest', async () => {
  const expectFileName = expect.getState().currentTestName?.replace(/^([tT][0-9]+)(-.+)/, 'expect$2.ts') ?? 'N/A';

  // project://example\handlers\get\justice\world.ts
  // project://example\handlers\get\xman\world.ts
  const routeFilePath = posixJoin(env.handlerPath, 'get', 'justice', 'world.ts');
  const source = share.project.getSourceFileOrThrow(routeFilePath);
  const handlerWithOption = getHandlerWithOption(source);
  const handler = handlerWithOption.find((node) => node.kind === 'handler');

  if (isEmpty(handler)) {
    throw new Error('invalid handler');
  }

  const routeHandlerFiles = await getRouteFiles(share.option.handler);
  const testRouteHandlerFile = routeHandlerFiles
    .filter((routeHandlerFile) => routeHandlerFile.method === 'get')
    .find((routeHandlerFile) => routeHandlerFile.filename === routeFilePath);

  if (isEmpty(testRouteHandlerFile)) {
    throw new Error(`Cannot create route handler configuration: ${routeFilePath}`);
  }

  const hash = getHash(replaceSepToPosix(path.relative(env.examplePath, source.getFilePath().toString())));
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

  log.debug(terminateCircularResult);

  expect(terminateCircularResult).toEqual(expectation.default);
});
