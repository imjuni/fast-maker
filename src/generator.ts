import IImportConfiguration from '@compiler/interface/IImportConfiguration';
import IReason from '@compiler/interface/IReason';
import THandlerNode, { IHandlerStatement, IOptionStatement } from '@compiler/interface/THandlerNode';
import getHandlerWithOption from '@compiler/navigate/getHandlerWithOption';
import getTypeScriptConfig from '@compiler/tool/getTypeScriptConfig';
import getTypeScriptProject from '@compiler/tool/getTypeScriptProject';
import dedupeImportConfiguration from '@generator/dedupeImportConfiguration';
import importCodeGenerator from '@generator/importCodeGenerator';
import prettierProcessing from '@generator/prettierProcessing';
import routeCodeGenerator from '@generator/routeCodeGenerator';
import { IOption } from '@module/IOption';
import { CliUx } from '@oclif/core';
import getRouteFiles from '@route/getRouteFiles';
import IRouteConfiguration from '@route/interface/IRouteConfiguration';
import IRouteHandler from '@route/interface/IRouteHandler';
import getHash from '@tool/getHash';
import type { IContextRequestHandlerAnalysisMachine as IAnalysisMachineContext } from '@xstate/RequestHandlerAnalysisMachine';
import requestHandlerAnalysisMachine from '@xstate/RequestHandlerAnalysisMachine';
import chalk from 'chalk';
import consola from 'consola';
import fs from 'fs';
import { isEmpty, isFalse, isNotEmpty } from 'my-easy-fp';
import { fail, isFail, pass, PassFailEither } from 'my-only-either';
import path from 'path';
import { interpret } from 'xstate';
import fastSafeStringify from 'fast-safe-stringify';
import * as tsm from 'ts-morph';

export default async function generator(
  option: IOption,
): Promise<PassFailEither<Error, { code: string; reasons: IReason[] }>> {
  const customBar = CliUx.ux.progress({
    format: 'PROGRESS | {bar} | {value}/{total} Files',
    barCompleteChar: '\u25A0',
    barIncompleteChar: ' ',
    stopOnComplete: true,
  });

  const logObject: Record<string, any> = {};

  try {
    const typeScriptConfigEither = await getTypeScriptConfig({ tsconfigPath: option.project });

    if (isFail(typeScriptConfigEither)) {
      throw typeScriptConfigEither.fail;
    }

    CliUx.ux.action.status = `load tsconfig.json: ${option.project}`;
    await CliUx.ux.wait(300);
    CliUx.ux.action.status = 'typescript handler source loading, ...';

    const typeScriptProjectEither = await getTypeScriptProject(option.project);

    if (isFail(typeScriptProjectEither)) {
      throw typeScriptProjectEither.fail;
    }

    CliUx.ux.action.status = 'typescript handler source complete, ...';

    const project = typeScriptProjectEither.pass;
    const reasons: IReason[] = [];
    const routeFiles = await getRouteFiles(option.path.handler);
    const routeFileRecord = routeFiles.reduce<Record<string, IRouteHandler>>((aggregation, routeFile) => {
      return { ...aggregation, [routeFile.filename]: routeFile };
    }, {});

    logObject.config = option;
    logObject.routeFiles = routeFiles;

    customBar.start(routeFiles.length, 0);

    const filterUsingTsProjectConfig = routeFiles.reduce<{ uniqueness: IRouteHandler[]; notFound: IRouteHandler[] }>(
      (aggregation, routeFile) => {
        const source = typeScriptProjectEither.pass.getSourceFile(routeFile.filename);

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

        const relativePath = path.relative(option.path.output, source.getFilePath().toString());
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

        customBar.increment();

        return basicRouteInfo;
      }),
    );

    const routesAnalysised = rawRoutesAnalysised.reduce<{
      importBox: IAnalysisMachineContext['importBox'][];
      routeBox: IAnalysisMachineContext['routeBox'][];
      reasons: IAnalysisMachineContext['messages'][];
    }>(
      (aggregated, current) => {
        return {
          importBox: [...aggregated.importBox, current.importBox],
          routeBox: [...aggregated.routeBox, current.routeBox],
          reasons: [...aggregated.reasons, current.messages],
        };
      },
      {
        importBox: [],
        routeBox: [],
        reasons: [],
      },
    );

    const importConfigurations = dedupeImportConfiguration(
      routesAnalysised.importBox.reduce<IImportConfiguration[]>((source, target) => {
        return source.concat(Object.values(target));
      }, []),
    );

    const routeConfigurations = routesAnalysised.routeBox.reduce<IRouteConfiguration[]>((source, target) => {
      return source.concat(Object.values(target));
    }, []);

    logObject.importConfigurations = importConfigurations;
    logObject.routeConfigurations = importConfigurations;

    const importCodes = importCodeGenerator({ importConfigurations, option });
    const routeCodes = routeCodeGenerator({ routeConfigurations, option });

    reasons.push(...routesAnalysised.reasons.flatMap((reason) => reason));

    logObject.importCodes = importCodes;
    logObject.routeCodes = routeCodes;

    const finalCode = [
      `import { FastifyInstance } from 'fastify';`,
      ...importCodes,
      '\n',
      `export default function routing(fastify: FastifyInstance): void {`,
      ...routeCodes,
      `}`,
    ];

    logObject.finalCode = importCodes;

    if ((isNotEmpty(option.debugLog) && isFalse(option.debugLog)) || routeConfigurations.length <= 0) {
      CliUx.ux.action.status = 'Cannot generate route path!';
      await fs.promises.writeFile(
        'fast-maker.debug.info.log',
        fastSafeStringify(
          logObject,
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
    }

    const prettfiedEither = await prettierProcessing({ code: finalCode.join('\n') });

    consola.debug('--------------------------------------------------------');
    consola.debug(prettfiedEither);
    consola.debug('--------------------------------------------------------');

    if (isFail(prettfiedEither)) {
      throw prettfiedEither.fail;
    }

    customBar.update(routeFiles.length);

    return pass({ code: prettfiedEither.pass, reasons });
  } catch (catched) {
    const err = catched instanceof Error ? catched : new Error('unknown error raised');

    logObject.err = {
      message: err.message,
      stack: err.stack ?? '',
    };

    await fs.promises.writeFile('fast-maker.debug.info.log', fastSafeStringify(logObject));

    return fail(err);
  } finally {
    customBar.stop();
  }
}
