import type IImportConfiguration from '#/compilers/interfaces/IImportConfiguration';
import type IReason from '#/compilers/interfaces/IReason';
import getHandlerWithOption from '#/compilers/navigate/getHandlerWithOption';
import type { TRouteOption } from '#/configs/interfaces/TRouteOption';
import type { TWatchOption } from '#/configs/interfaces/TWatchOption';
import StateMachineError from '#/errors/StateMachineError';
import type IRouteConfiguration from '#/routes/interface/IRouteConfiguration';
import type IRouteHandler from '#/routes/interface/IRouteHandler';
import getHash from '#/tools/getHash';
import { CE_REQUEST_HANDLER_ANALYSIS_MACHINE } from '#/xstate/interfaces/CE_REQUEST_HANDLER_ANALYSIS_MACHINE';
import requestHandlerAnalysisMachine from '#/xstate/RequestHandlerAnalysisMachine';
import { fail, pass, type PassFailEither } from 'my-only-either';
import path from 'path';
import type { Project } from 'ts-morph';
import { interpret } from 'xstate';
import { waitFor } from 'xstate/lib/waitFor';

export default async function doAnalysisRequestStatement(
  project: Project,
  option: TRouteOption | TWatchOption,
  handler: IRouteHandler,
): Promise<
  PassFailEither<
    StateMachineError,
    {
      imports: Record<string, IImportConfiguration>;
      routes: Record<string, IRouteConfiguration>;
      reasons: { handler: IRouteHandler; reason: IReason }[];
    }
  >
> {
  const sourceFile = project.getSourceFileOrThrow(handler.filePath);
  const handlerNode = getHandlerWithOption(sourceFile);

  if (handlerNode.handler == null) {
    const reason: IReason = {
      type: 'error',
      message: `Cannot found handler function in source: ${handler.filePath}`,
      filePath: handler.filePath,
    } satisfies IReason;

    return fail(new StateMachineError(handler, reason, `Cannot found handler function in source: ${handler.filePath}`));
  }

  const relativePath = path.relative(option.output, sourceFile.getFilePath().toString());
  const hash = getHash(relativePath);

  const machine = requestHandlerAnalysisMachine({
    project,
    source: sourceFile,
    hash,
    routing: handler,
    routeHandler: handlerNode.handler,
    routeOption: handlerNode.option,
    option,
  });

  const interpretor = interpret(machine);
  const actor = interpretor.start();
  await waitFor(actor, (state) => state.matches(CE_REQUEST_HANDLER_ANALYSIS_MACHINE.DONE));

  const { reasons: reasonFromMachine, importMap, routeMap } = interpretor.getSnapshot().context;

  return pass({
    imports: Object.entries(importMap).reduce((aggregation, [key, value]) => {
      return {
        ...aggregation,
        [key]: {
          hash: value.hash,
          namedBindings: value.namedBindings,
          nonNamedBinding: value.nonNamedBinding,
          nonNamedBindingIsPureType: value.nonNamedBindingIsPureType,
          importFile: value.importFile,
        },
      };
    }, {}),
    routes: Object.entries(routeMap).reduce((aggregation, [key, value]) => {
      return {
        ...aggregation,
        [key]: {
          method: value.method,
          routePath: value.routePath,
          hash: value.hash,
          hasOption: value.hasOption,
          handlerName: value.handlerName,
          typeArgument: value.typeArgument,
          sourceFilePath: value.sourceFilePath,
        },
      };
    }, {}),
    reasons: reasonFromMachine
      .map((reason) => ({ handler, reason }))
      .map((reason) => {
        return {
          handler: reason.handler,
          reason: {
            type: reason.reason.type,
            lineAndCharacter: reason.reason.lineAndCharacter,
            filePath: reason.reason.filePath,
            message: reason.reason.message,
          } satisfies IReason,
        };
      }),
  });
}
