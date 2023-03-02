import progress from '#cli/display/progress';
import type IReason from '#compilers/interfaces/IReason';
import type { IHandlerStatement, IOptionStatement } from '#compilers/interfaces/THandlerNode';
import getHandlerWithOption from '#compilers/navigate/getHandlerWithOption';
import type { TRouteOption } from '#configs/interfaces/TRouteOption';
import type { TWatchOption } from '#configs/interfaces/TWatchOption';
import getMethodColor from '#modules/getMethodColor';
import reasons from '#modules/reasons';
import type { CE_ROUTE_METHOD } from '#routes/interface/CE_ROUTE_METHOD';
import type IRouteHandler from '#routes/interface/IRouteHandler';
import getHash from '#tools/getHash';
import { CE_REQUEST_HANDLER_ANALYSIS_MACHINE } from '#xstate/interfaces/CE_REQUEST_HANDLER_ANALYSIS_MACHINE';
import requestHandlerAnalysisMachine from '#xstate/RequestHandlerAnalysisMachine';
import chalk from 'chalk';
import path from 'path';
import type { Project } from 'ts-morph';
import type { Entries } from 'type-fest';
import { interpret } from 'xstate';
import { waitFor } from 'xstate/lib/waitFor';

export default async function doStateMachine(
  project: Project,
  config: TRouteOption | TWatchOption,
  handlerMap: Record<CE_ROUTE_METHOD, IRouteHandler[]>,
) {
  const handlerWithNodes = (Object.entries(handlerMap) as Entries<typeof handlerMap>)
    .map(([, routeHandlers]: [CE_ROUTE_METHOD, IRouteHandler[]]) => {
      const handlers = routeHandlers
        .map((route) => {
          const sourceFile = project.getSourceFileOrThrow(route.filePath);
          const withOptions = getHandlerWithOption(sourceFile);
          return { route, option: withOptions.option, handler: withOptions.handler };
        })
        .flat();

      return handlers;
    })
    .flat()
    .reduce<{
      nullable: { route: IRouteHandler; option?: IOptionStatement; handler?: IHandlerStatement }[];
      nonNullable: { route: IRouteHandler; option?: IOptionStatement; handler: IHandlerStatement }[];
    }>(
      (aggregation, withNode) => {
        const { handler } = withNode;
        if (handler == null) {
          return { ...aggregation, nullable: [...aggregation.nullable, withNode] };
        }
        return {
          ...aggregation,
          nonNullable: [...aggregation.nonNullable, { handler, option: withNode.option, route: withNode.route }],
        };
      },
      { nullable: [], nonNullable: [] },
    );

  reasons.add(
    ...handlerWithNodes.nullable.map((nullable) => {
      return {
        type: 'error',
        message: `Cannot found handler function in source: ${nullable.route.filePath}`,
        filePath: nullable.route.filePath,
      } satisfies IReason;
    }),
  );

  const results = await Promise.all(
    handlerWithNodes.nonNullable.map(async (withNode) => {
      const sourceFile = withNode.handler.node.getSourceFile();
      const relativePath = path.relative(config.output, sourceFile.getFilePath().toString());
      const hash = getHash(relativePath);

      const machine = requestHandlerAnalysisMachine({
        project,
        source: sourceFile,
        hash,
        routing: withNode.route,
        routeHandler: withNode.handler,
        routeOption: withNode.option,
        option: config,
      });

      const interpretor = interpret(machine);
      const actor = interpretor.start();
      await waitFor(actor, (state) => state.matches(CE_REQUEST_HANDLER_ANALYSIS_MACHINE.DONE));

      const methorColorStr = chalk[getMethodColor(withNode.route.method, 'foreground')](withNode.route.method);
      progress.increment(`${methorColorStr} ${withNode.route.routePath}`);

      const { messages, importMap, routeMap } = interpretor.getSnapshot().context;
      return { messages, importMap, routeMap };
    }),
  );

  return results;
}
