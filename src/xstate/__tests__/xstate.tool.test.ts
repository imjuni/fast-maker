import getHandlerWithOption from '#compilers/navigate/getHandlerWithOption';
import getResolvedPaths from '#configs/getResolvedPaths';
import summaryRouteHandlerFile from '#modules/summaryRouteHandlerFile';
import JestContext from '#tools/__tests__/tools/context';
import * as env from '#tools/__tests__/tools/env';
import loadSourceData from '#tools/__tests__/tools/loadSourceData';
import getHash from '#tools/getHash';
import getRelativeCwd from '#tools/getRelativeCwd';
import logger from '#tools/logger';
import posixJoin from '#tools/posixJoin';
import requestHandlerAnalysisMachine from '#xstate/RequestHandlerAnalysisMachine';
import { CE_REQUEST_HANDLER_ANALYSIS_MACHINE } from '#xstate/interfaces/CE_REQUEST_HANDLER_ANALYSIS_MACHINE';
import { getExpectValue } from '@maeum/test-utility';
import 'jest';
import { isError } from 'my-easy-fp';
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
    ...getResolvedPaths({ project: context.projectPath, handler: env.handlerPath, output: env.examplePath }),
  };
});

describe('requestHandlerAnalysisMachine', () => {
  test('t001-FSM-TypeLiteral', async () => {
    try {
      // project://example\handlers\get\justice\world.ts
      // project://example\handlers\get\xman\world.ts
      const routeFilePath = posixJoin(env.handlerPath, 'get', 'xman', 'world.ts');
      const sourceFile = context.project.getSourceFileOrThrow(routeFilePath);
      const routeHandler = await summaryRouteHandlerFile(routeFilePath, context.routeOption);
      const routing = getHandlerWithOption(sourceFile);
      const hash = getHash(getRelativeCwd(env.handlerPath, routeHandler.filePath));

      const machine = requestHandlerAnalysisMachine({
        project: context.project,
        source: sourceFile,
        hash,
        routing: routeHandler,
        routeHandler: routing.handler!,
        routeOption: routing.option,
        option: context.routeOption,
      });

      const interpretor = interpret(machine);
      const actor = interpretor.start();
      await waitFor(actor, (state) => state.matches(CE_REQUEST_HANDLER_ANALYSIS_MACHINE.DONE));
      const { reasons: messages, importMap: importBox, routeMap: routeBox } = interpretor.getSnapshot().context;

      const expectation = await loadSourceData<any>('default', path.join(__dirname, 'expects', 'expect.out.01.ts'));
      const terminateCircularResult = getExpectValue({ messages, importBox, routeBox }, (_, value: any) => {
        if (value === '[Circular]') return undefined;
        if (value instanceof tsm.Node) return undefined;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return value;
      });

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
    const routeHandler = await summaryRouteHandlerFile(routeFilePath, context.routeOption);
    const routing = getHandlerWithOption(sourceFile);
    const hash = getHash(getRelativeCwd(env.handlerPath, routeHandler.filePath));

    const machine = requestHandlerAnalysisMachine({
      project: context.project,
      source: sourceFile,
      hash,
      routing: routeHandler,
      routeHandler: routing.handler!,
      routeOption: routing.option,
      option: context.routeOption,
    });

    const interpretor = interpret(machine);
    const actor = interpretor.start();
    await waitFor(actor, (state) => state.matches(CE_REQUEST_HANDLER_ANALYSIS_MACHINE.DONE));
    const { reasons: messages, importMap: importBox, routeMap: routeBox } = interpretor.getSnapshot().context;

    const expectation = await loadSourceData<any>('default', path.join(__dirname, 'expects', 'expect.out.02.ts'));
    const terminateCircularResult = getExpectValue({ messages, importBox, routeBox }, (_, value: any) => {
      if (value === '[Circular]') return undefined;
      if (value instanceof tsm.Node) return undefined;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value;
    });

    log.debug(terminateCircularResult);

    expect(terminateCircularResult).toMatchObject(expectation);
  });

  test('async function no parameter', async () => {
    try {
      // project://example\handlers\get\justice\world.ts
      // project://example\handlers\get\xman\world.ts
      const routeFilePath = posixJoin(env.handlerPath, 'delete', 'hello.ts');
      const sourceFile = context.project.getSourceFileOrThrow(routeFilePath);
      const routeHandler = await summaryRouteHandlerFile(routeFilePath, context.routeOption);
      const routing = getHandlerWithOption(sourceFile);
      const hash = getHash(getRelativeCwd(env.handlerPath, routeHandler.filePath));

      const machine = requestHandlerAnalysisMachine({
        project: context.project,
        source: sourceFile,
        hash,
        routing: routeHandler,
        routeHandler: routing.handler!,
        routeOption: routing.option,
        option: context.routeOption,
      });

      const interpretor = interpret(machine);
      const actor = interpretor.start();
      await waitFor(actor, (state) => state.matches(CE_REQUEST_HANDLER_ANALYSIS_MACHINE.DONE));
      const { reasons: messages, importMap: importBox, routeMap: routeBox } = interpretor.getSnapshot().context;

      const expectation = await loadSourceData<any>('default', path.join(__dirname, 'expects', 'expect.out.03.ts'));
      const terminateCircularResult = getExpectValue({ messages, importBox, routeBox }, (_, value: any) => {
        if (value === '[Circular]') return undefined;
        if (value instanceof tsm.Node) return undefined;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return value;
      });

      expect(terminateCircularResult).toMatchObject(expectation);
    } catch (caught) {
      const err = isError(caught, new Error('unknown error raised'));

      console.error(err.message);
      console.error(err.stack);

      expect(caught).toBeUndefined();
    }
  });

  test('async anonymous function no parameter', async () => {
    try {
      // project://example\handlers\get\justice\world.ts
      // project://example\handlers\get\xman\world.ts
      const routeFilePath = posixJoin(env.handlerPath, 'post', 'dc', 'world.ts');
      const sourceFile = context.project.getSourceFileOrThrow(routeFilePath);
      const routeHandler = await summaryRouteHandlerFile(routeFilePath, context.routeOption);
      const routing = getHandlerWithOption(sourceFile);
      const hash = getHash(getRelativeCwd(env.handlerPath, routeHandler.filePath));

      const machine = requestHandlerAnalysisMachine({
        project: context.project,
        source: sourceFile,
        hash,
        routing: routeHandler,
        routeHandler: routing.handler!,
        routeOption: routing.option,
        option: context.routeOption,
      });

      const interpretor = interpret(machine);
      const actor = interpretor.start();
      await waitFor(actor, (state) => state.matches(CE_REQUEST_HANDLER_ANALYSIS_MACHINE.DONE));
      const { reasons: messages, importMap: importBox, routeMap: routeBox } = interpretor.getSnapshot().context;

      const expectation = await loadSourceData<any>('default', path.join(__dirname, 'expects', 'expect.out.04'));
      const terminateCircularResult = getExpectValue({ messages, importBox, routeBox }, (_, value: any) => {
        if (value === '[Circular]') return undefined;
        if (value instanceof tsm.Node) return undefined;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return value;
      });

      expect(terminateCircularResult).toMatchObject(expectation);
    } catch (caught) {
      const err = isError(caught, new Error('unknown error raised'));

      console.error(err.message);
      console.error(err.stack);

      expect(caught).toBeUndefined();
    }
  });

  test('sync function no parameter', async () => {
    try {
      // project://example\handlers\get\justice\world.ts
      // project://example\handlers\get\xman\world.ts
      const sourceCode = `
      // import { RouteShorthandOptions } from 'fastify';
      import { FastifyRequest, FastifyReply, RouteShorthandOptions } from 'fastify';
      import { Server } from 'http';
      import type IReqPokeHello from '../interface/IReqPokeHello';
      import schema from '../interface/JSC_IReqPokeHello';
      
      export const option: RouteShorthandOptions = {
        schema: {
          querystring: schema.properties?.Querystring,
          body: schema.properties?.Body,
        },
      };
      
      export default function world() {
        console.debug(req.query);
        console.debug(req.body);
      
        return 'world';
      };
      
      export default world;`;

      const routeFilePath = posixJoin(env.handlerPath, 'get', 'po-ke', 'c1.ts');
      const sourceFile = context.project.createSourceFile(routeFilePath, sourceCode, { overwrite: true });
      const routeHandler = await summaryRouteHandlerFile(routeFilePath, context.routeOption);
      const routing = getHandlerWithOption(sourceFile);
      const hash = getHash(getRelativeCwd(env.handlerPath, routeHandler.filePath));

      const machine = requestHandlerAnalysisMachine({
        project: context.project,
        source: sourceFile,
        hash,
        routing: routeHandler,
        routeHandler: routing.handler!,
        routeOption: routing.option,
        option: context.routeOption,
      });

      const interpretor = interpret(machine);
      const actor = interpretor.start();
      await waitFor(actor, (state) => state.matches(CE_REQUEST_HANDLER_ANALYSIS_MACHINE.DONE));
      const { reasons: messages, importMap: importBox, routeMap: routeBox } = interpretor.getSnapshot().context;

      const expectation = await loadSourceData<any>('default', path.join(__dirname, 'expects', 'expect.out.05'));
      const terminateCircularResult = getExpectValue({ messages, importBox, routeBox }, (_, value: any) => {
        if (value === '[Circular]') return undefined;
        if (value instanceof tsm.Node) return undefined;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return value;
      });

      expect(terminateCircularResult).toMatchObject(expectation);
    } catch (caught) {
      const err = isError(caught, new Error('unknown error raised'));

      console.error(err.message);
      console.error(err.stack);

      expect(caught).toBeUndefined();
    }
  });

  test('invalid type parameter no parameter', async () => {
    try {
      // project://example\handlers\get\justice\world.ts
      // project://example\handlers\get\xman\world.ts
      const sourceCode = `
      // import { RouteShorthandOptions } from 'fastify';
      import { FastifyRequest, FastifyReply, RouteShorthandOptions } from 'fastify';
      import { Server } from 'http';
      import type IReqPokeHello from '../interface/IReqPokeHello';
      import schema from '../interface/JSC_IReqPokeHello';
      
      export const option: RouteShorthandOptions = {
        schema: {
          querystring: schema.properties?.Querystring,
          body: schema.properties?.Body,
        },
      };
      
      export default async function world(req: FastifyRequest<{ Querstring: IReqPokeHello['querystring']; Body: IReqPokeHello['Body']; }>) {
        console.debug(req.query);
        console.debug(req.body);
      
        return 'world';
      };
      
      export default world;`;

      const routeFilePath = posixJoin(env.handlerPath, 'get', 'po-ke', 'c3.ts');
      const sourceFile = context.project.createSourceFile(routeFilePath, sourceCode, { overwrite: true });
      const routeHandler = await summaryRouteHandlerFile(routeFilePath, context.routeOption);
      const routing = getHandlerWithOption(sourceFile);
      const hash = getHash(getRelativeCwd(env.handlerPath, routeHandler.filePath));

      const machine = requestHandlerAnalysisMachine({
        project: context.project,
        source: sourceFile,
        hash,
        routing: routeHandler,
        routeHandler: routing.handler!,
        routeOption: routing.option,
        option: context.routeOption,
      });

      const interpretor = interpret(machine);
      const actor = interpretor.start();
      await waitFor(actor, (state) => state.matches(CE_REQUEST_HANDLER_ANALYSIS_MACHINE.DONE));
      const { reasons: messages, importMap: importBox, routeMap: routeBox } = interpretor.getSnapshot().context;

      const expectation = await loadSourceData<any>('default', path.join(__dirname, 'expects', 'expect.out.06'));
      const terminateCircularResult = getExpectValue({ messages, importBox, routeBox }, (_, value: any) => {
        if (value === '[Circular]') return undefined;
        if (value instanceof tsm.Node) return undefined;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return value;
      });

      expect(terminateCircularResult).toMatchObject(expectation);
    } catch (caught) {
      const err = isError(caught, new Error('unknown error raised'));

      console.error(err.message);
      console.error(err.stack);

      expect(caught).toBeUndefined();
    }
  });
});
