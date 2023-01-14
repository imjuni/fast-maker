import progress from '#cli/display/progress';
import type IReason from '#compiler/interface/IReason';
import type THandlerNode from '#compiler/interface/THandlerNode';
import type { IHandlerStatement, IOptionStatement } from '#compiler/interface/THandlerNode';
import getHandlerWithOption from '#compiler/navigate/getHandlerWithOption';
import type IConfig from '#config/interface/IConfig';
import type IStage02Log from '#module/interface/IStage02Log';
import type IRouteHandler from '#route/interface/IRouteHandler';
import getHash from '#tool/getHash';
import type { IAnalysisMachineContext } from '#xstate/RequestHandlerAnalysisMachine';
import requestHandlerAnalysisMachine from '#xstate/RequestHandlerAnalysisMachine';
import chalk from 'chalk';
import path from 'path';
import { type Project } from 'ts-morph';
import { interpret } from 'xstate';

export default async function proceedStage02(project: Project, option: IConfig, handlers: IRouteHandler[]) {
  const reasons: IReason[] = [];
  const logObject: Partial<IStage02Log> = {};

  const routeFileRecord = handlers.reduce<Record<string, IRouteHandler>>((aggregation, routeFile) => {
    return { ...aggregation, [routeFile.filename]: routeFile };
  }, {});

  const { fileExists, fileNotFound } = handlers.reduce<{
    fileExists: IRouteHandler[];
    fileNotFound: IRouteHandler[];
  }>(
    (aggregation, routeFile) => {
      const source = project.getSourceFile(routeFile.filename);

      if (source != null) {
        return { ...aggregation, fileExists: [...aggregation.fileExists, routeFile] };
      }

      return { ...aggregation, fileNotFound: [...aggregation.fileNotFound, routeFile] };
    },
    { fileExists: [], fileNotFound: [] },
  );

  logObject.fileExists = fileExists;
  logObject.fileNotFound = fileNotFound;

  reasons.push(
    ...fileNotFound.map((notFoundRouteFile) => {
      const reason: IReason = {
        type: 'error',
        message: `Cannot found source file in typescript project: ${notFoundRouteFile.filename}`,
        filePath: notFoundRouteFile.filename,
      };

      return reason;
    }),
  );

  const routeNodeRecords = fileExists.reduce<Record<string, THandlerNode[]>>((aggregation, routeFile) => {
    const source = project.getSourceFile(routeFile.filename);

    // 앞서 source가 빈 경우는 notFound로 분류해서 아래 코드는 실행될 일이 없다,
    // In normalcase, throw not reached
    if (source == null) {
      throw new Error(`Source-code is empty: ${routeFile.filename}`);
    }

    const nodes = getHandlerWithOption(source);
    return { ...aggregation, [routeFile.filename]: nodes };
  }, {});

  const { functionExists, functionNotFound } = Object.entries(routeNodeRecords).reduce<{
    functionExists: Array<{ filename: string; nodes: THandlerNode[] }>;
    functionNotFound: Array<{ filename: string; nodes: THandlerNode[] }>;
  }>(
    (aggregation, entry) => {
      const [filename, handlerNodes] = entry;
      const routeHandler = handlerNodes.find((node): node is IHandlerStatement => node.kind === 'handler');

      if (routeHandler != null) {
        return { ...aggregation, functionExists: [...aggregation.functionExists, { filename, nodes: handlerNodes }] };
      }

      return { ...aggregation, functionNotFound: [...aggregation.functionNotFound, { filename, nodes: handlerNodes }] };
    },
    {
      functionExists: [],
      functionNotFound: [],
    },
  );

  reasons.push(
    ...functionNotFound.map((nodeHandler) => {
      const reason: IReason = {
        type: 'error',
        message: `Cannot found handler function in source: ${nodeHandler.filename}`,
        filePath: nodeHandler.filename,
      };

      return reason;
    }),
  );

  logObject.functionNotFound = functionNotFound;

  const { routePathUnique, routePathDuplicate } = functionExists.reduce<{
    dedupeRecord: Record<string, { filename: string; nodes: THandlerNode[] }>;
    routePathUnique: Array<{ filename: string; nodes: THandlerNode[] }>;
    routePathDuplicate: Array<{ filename: string; nodes: THandlerNode[] }>;
  }>(
    (aggregation, handlerNode) => {
      const routeFile = routeFileRecord[handlerNode.filename];
      const key = `[${routeFile.method}] ${routeFile.routePath}`;

      if (aggregation.dedupeRecord[key] == null) {
        return {
          ...aggregation,
          dedupeRecord: { ...aggregation.dedupeRecord, [key]: handlerNode },
          routePathUnique: [...aggregation.routePathUnique, handlerNode],
        };
      }

      const reason: IReason = {
        type: 'error',
        message: `Found duplicated routePath(${chalk.red(key)}): ${handlerNode.filename}`,
        filePath: handlerNode.filename,
      };

      reasons.push(reason);

      return {
        ...aggregation,
        routePathDuplicate: [...aggregation.routePathDuplicate, handlerNode],
      };
    },
    {
      dedupeRecord: {},
      routePathUnique: [],
      routePathDuplicate: [],
    },
  );

  logObject.routePathUnique = routePathUnique;
  logObject.routePathDuplicate = routePathDuplicate;

  const result = await Promise.all(
    routePathUnique.map(async (handlerNode) => {
      const source = project.getSourceFile(handlerNode.filename);

      if (source == null) {
        throw new Error(`Source-code is empty: ${handlerNode.filename}`);
      }

      const relativePath = path.relative(option.output, source.getFilePath().toString());
      const hash = getHash(relativePath);
      const routeHandler = handlerNode.nodes.find((node): node is IHandlerStatement => node.kind === 'handler');
      const routeOption = handlerNode.nodes.find((node): node is IOptionStatement => node.kind === 'option');

      if (routeHandler == null) {
        throw new Error(`Cannot found route handler function: ${source.getFilePath().toString()}`);
      }

      const routeFile = routeFileRecord[handlerNode.filename];

      const machine = requestHandlerAnalysisMachine({
        project,
        source,
        hash,
        routeHandler: routeFile,
        handler: routeHandler,
        routeOption,
        option,
      });

      const service = interpret(machine);

      const basicRouteInfo = await new Promise<Pick<IAnalysisMachineContext, 'importBox' | 'routeBox' | 'messages'>>(
        (resolve) => {
          service.onDone((data) => resolve(data.data));
          service.start();
        },
      );

      progress.increment();

      return basicRouteInfo;
    }),
  );

  return {
    reasons,
    logObject,
    result,
  };
}
