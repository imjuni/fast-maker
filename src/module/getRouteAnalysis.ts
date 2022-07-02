import progress from '@cli/progress';
import IReason from '@compiler/interface/IReason';
import THandlerNode, { IHandlerStatement, IOptionStatement } from '@compiler/interface/THandlerNode';
import getHandlerWithOption from '@compiler/navigate/getHandlerWithOption';
import IConfig from '@config/interface/IConfig';
import IRouteHandler from '@route/interface/IRouteHandler';
import getHash from '@tool/getHash';
import type { IContextRequestHandlerAnalysisMachine as IAnalysisMachineContext } from '@xstate/RequestHandlerAnalysisMachine';
import requestHandlerAnalysisMachine from '@xstate/RequestHandlerAnalysisMachine';
import chalk from 'chalk';
import { isEmpty, isNotEmpty } from 'my-easy-fp';
import path from 'path';
import * as tsm from 'ts-morph';
import { interpret } from 'xstate';

export default async function getRouteAnalysis(project: tsm.Project, option: IConfig, routeHandlers: IRouteHandler[]) {
  const reasons: IReason[] = [];
  const logObject: Record<string, any> = {};

  const routeFileRecord = routeHandlers.reduce<Record<string, IRouteHandler>>((aggregation, routeFile) => {
    return { ...aggregation, [routeFile.filename]: routeFile };
  }, {});

  progress.start(routeHandlers.length, 0);

  const filterUsingTsProjectConfig = routeHandlers.reduce<{ uniqueness: IRouteHandler[]; notFound: IRouteHandler[] }>(
    (aggregation, routeFile) => {
      const source = project.getSourceFile(routeFile.filename);

      if (isNotEmpty(source)) {
        return { ...aggregation, uniqueness: [...aggregation.uniqueness, routeFile] };
      }

      return { ...aggregation, notFound: [...aggregation.notFound, routeFile] };
    },
    { uniqueness: [], notFound: [] },
  );

  logObject.routeFileUniqueness = filterUsingTsProjectConfig.uniqueness;
  logObject.routeFileNotInSource = filterUsingTsProjectConfig.notFound;

  reasons.push(
    ...filterUsingTsProjectConfig.notFound.map((notFoundRouteFile) => {
      const reason: IReason = {
        type: 'error',
        message: `Cannot found source file in typescript project: ${notFoundRouteFile.filename}`,
        filePath: notFoundRouteFile.filename,
      };

      return reason;
    }),
  );

  const routeNodeRecords = filterUsingTsProjectConfig.uniqueness.reduce<Record<string, THandlerNode[]>>(
    (aggregation, routeFile) => {
      const source = project.getSourceFile(routeFile.filename);

      // 앞서 source가 빈 경우는 notFound로 분류해서 아래 코드는 실행될 일이 없다,
      // In normalcase, throw not reached
      if (isEmpty(source)) {
        throw new Error(`Source-code is empty: ${routeFile.filename}`);
      }

      const nodes = getHandlerWithOption(source);
      return { ...aggregation, [routeFile.filename]: nodes };
    },
    {},
  );

  const discriminateExistHandler = Object.entries(routeNodeRecords).reduce<{
    haveHandler: Array<{ filename: string; nodes: THandlerNode[] }>;
    notHandler: Array<{ filename: string; nodes: THandlerNode[] }>;
  }>(
    (aggregation, entry) => {
      const [filename, handlerNodes] = entry;
      const routeHandler = handlerNodes.find((node): node is IHandlerStatement => node.kind === 'handler');

      if (isNotEmpty(routeHandler)) {
        return { ...aggregation, haveHandler: [...aggregation.haveHandler, { filename, nodes: handlerNodes }] };
      }

      return { ...aggregation, notHandler: [...aggregation.notHandler, { filename, nodes: handlerNodes }] };
    },
    {
      haveHandler: [],
      notHandler: [],
    },
  );

  reasons.push(
    ...discriminateExistHandler.notHandler.map((nodeHandler) => {
      const reason: IReason = {
        type: 'error',
        message: `Cannot found handler function in source: ${nodeHandler.filename}`,
        filePath: nodeHandler.filename,
      };

      return reason;
    }),
  );

  logObject.notHandler = discriminateExistHandler.notHandler;

  const discriminateDuplicateRoutePath = discriminateExistHandler.haveHandler.reduce<{
    uniquenessRecord: Record<string, { filename: string; nodes: THandlerNode[] }>;
    uniqueness: Array<{ filename: string; nodes: THandlerNode[] }>;
    duplication: Array<{ filename: string; nodes: THandlerNode[] }>;
  }>(
    (aggregation, handlerNode) => {
      const routeFile = routeFileRecord[handlerNode.filename];
      const key = `[${routeFile.method}] ${routeFile.routePath}`;

      if (isEmpty(aggregation.uniquenessRecord[key])) {
        return {
          ...aggregation,
          uniquenessRecord: { ...aggregation.uniquenessRecord, [key]: handlerNode },
          uniqueness: [...aggregation.uniqueness, handlerNode],
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
        duplication: [...aggregation.duplication, handlerNode],
      };
    },
    {
      uniquenessRecord: {},
      uniqueness: [],
      duplication: [],
    },
  );

  logObject.duplicateRoutePath = {
    uniqueness: discriminateDuplicateRoutePath.uniqueness,
    duplication: discriminateDuplicateRoutePath.duplication,
  };

  const rawRoutesAnalysised = await Promise.all(
    discriminateDuplicateRoutePath.uniqueness.map(async (handlerNode) => {
      const source = project.getSourceFile(handlerNode.filename);

      if (isEmpty(source)) {
        throw new Error(`Source-code is empty: ${handlerNode.filename}`);
      }

      const relativePath = path.relative(option.output, source.getFilePath().toString());
      const hash = getHash(relativePath);
      const routeHandler = handlerNode.nodes.find((node): node is IHandlerStatement => node.kind === 'handler');
      const routeOption = handlerNode.nodes.find((node): node is IOptionStatement => node.kind === 'option');

      if (isEmpty(routeHandler)) {
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
    routesAnalysised: rawRoutesAnalysised,
  };
}
