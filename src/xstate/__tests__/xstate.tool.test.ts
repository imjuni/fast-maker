import getHandlerWithOption from '#compilers/navigate/getHandlerWithOption';
import getResolvedPaths from '#configs/getResolvedPaths';
import doMethodAggregator from '#modules/doMethodAggregator';
import { CE_ROUTE_METHOD } from '#routes/interface/CE_ROUTE_METHOD';
import getHash from '#tools/getHash';
import getRelativeCwd from '#tools/getRelativeCwd';
import logger from '#tools/logging/logger';
import posixJoin from '#tools/posixJoin';
import JestContext from '#tools/__tests__/tools/context';
import * as env from '#tools/__tests__/tools/env';
import getTestValue from '#tools/__tests__/tools/getTestValue';
import loadData from '#tools/__tests__/tools/loadData';
import { CE_REQUEST_HANDLER_ANALYSIS_MACHINE } from '#xstate/interfaces/CE_REQUEST_HANDLER_ANALYSIS_MACHINE';
import requestHandlerAnalysisMachine from '#xstate/RequestHandlerAnalysisMachine';
import 'jest';
import { findOrThrow, isError } from 'my-easy-fp';
import path from 'path';
import * as tsm from 'ts-morph';
import { interpret } from 'xstate';
import { waitFor } from 'xstate/lib/waitFor';

const context = new JestContext();
const log = logger();

beforeAll(async () => {
  context.projectPath = path.join(env.examplePath, 'tsconfig.json');
  context.project = new tsm.Project({ tsConfigFilePath: context.projectPath });
  context.routeOption = {
    ...env.routeOption,
    ...getResolvedPaths({ project: context.projectPath, output: env.examplePath }),
  };
});

describe('requestHandlerAnalysisMachine', () => {
  test('t001-FSM-TypeLiteral', async () => {
    try {
      // project://example\handlers\get\justice\world.ts
      // project://example\handlers\get\xman\world.ts
      const routeFilePath = posixJoin(env.handlerPath, 'get', 'xman', 'world.ts');
      const sourceFile = context.project.getSourceFileOrThrow(routeFilePath);

      const methodAggregated = await doMethodAggregator(
        context.project.getSourceFiles().map((sf) => sf.getFilePath()),
        { ...env.routeOption, cwd: path.join(env.examplePath) },
      );

      const route = findOrThrow(methodAggregated[CE_ROUTE_METHOD.GET], (handler) => handler.filePath === routeFilePath);
      const routing = getHandlerWithOption(sourceFile);
      const hash = getHash(getRelativeCwd(env.handlerPath, route.filePath));

      const machine = requestHandlerAnalysisMachine({
        project: context.project,
        source: sourceFile,
        hash,
        routing: route,
        routeHandler: routing.handler!,
        routeOption: routing.option,
        option: context.routeOption,
      });

      const interpretor = interpret(machine);
      const actor = interpretor.start();
      await waitFor(actor, (state) => state.matches(CE_REQUEST_HANDLER_ANALYSIS_MACHINE.DONE));
      const { messages, importMap: importBox, routeMap: routeBox } = interpretor.getSnapshot().context;

      const expectation = await loadData<any>('default', path.join(__dirname, 'expects', 'expect.out.01.ts'));
      const terminateCircularResult = getTestValue({ messages, importBox, routeBox });

      log.debug(terminateCircularResult);

      expect(terminateCircularResult).toMatchObject(expectation);
    } catch (caught) {
      const err = isError(caught, new Error('unknown error raised'));

      console.error(err.message);
      console.error(err.stack);

      expect(caught).toBeUndefined();
    }
  });

  test('t002-FSM-FastifyRequest', async () => {
    // project://example\handlers\get\justice\world.ts
    // project://example\handlers\get\xman\world.ts
    const routeFilePath = posixJoin(env.handlerPath, 'get', 'justice', 'world.ts');
    const sourceFile = context.project.getSourceFileOrThrow(routeFilePath);

    const methodAggregated = await doMethodAggregator(
      context.project.getSourceFiles().map((sf) => sf.getFilePath()),
      { ...env.routeOption, cwd: path.join(env.examplePath) },
    );

    const route = findOrThrow(methodAggregated[CE_ROUTE_METHOD.GET], (handler) => handler.filePath === routeFilePath);
    const routing = getHandlerWithOption(sourceFile);
    const hash = getHash(getRelativeCwd(env.handlerPath, route.filePath));

    const machine = requestHandlerAnalysisMachine({
      project: context.project,
      source: sourceFile,
      hash,
      routing: route,
      routeHandler: routing.handler!,
      routeOption: routing.option,
      option: context.routeOption,
    });

    const interpretor = interpret(machine);
    const actor = interpretor.start();
    await waitFor(actor, (state) => state.matches(CE_REQUEST_HANDLER_ANALYSIS_MACHINE.DONE));
    const { messages, importMap: importBox, routeMap: routeBox } = interpretor.getSnapshot().context;

    const expectation = await loadData<any>('default', path.join(__dirname, 'expects', 'expect.out.02.ts'));
    const terminateCircularResult = getTestValue({ messages, importBox, routeBox });

    log.debug(terminateCircularResult);

    expect(terminateCircularResult).toEqual(expectation);
  });
});
