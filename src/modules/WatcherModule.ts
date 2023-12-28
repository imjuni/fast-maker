import show from '#/cli/display/show';
import spinner from '#/cli/display/spinner';
import type IReason from '#/compilers/interfaces/IReason';
import getHandlerWithOption from '#/compilers/navigate/getHandlerWithOption';
import type { TWatchOption } from '#/configs/interfaces/TWatchOption';
import importCodeGenerator from '#/generators/importCodeGenerator';
import prettierProcessing from '#/generators/prettierProcessing';
import routeCodeGenerator from '#/generators/routeCodeGenerator';
import routeMapGenerator from '#/generators/routeMapGenerator';
import doAnalysisRequestStatements from '#/modules/doAnalysisRequestStatements';
import getOutputFilePath from '#/modules/getOutputFilePath';
import getOutputMapFilePath from '#/modules/getOutputMapFilePath';
import getRoutingCode from '#/modules/getRoutingCode';
import getValidRoutePath from '#/modules/getValidRoutePath';
import { CE_WATCH_EVENT } from '#/modules/interfaces/CE_WATCH_EVENT';
import type IUpdateEvent from '#/modules/interfaces/IUpdateEvent';
import type IWatchEvent from '#/modules/interfaces/IWatchEvent';
import reasons from '#/modules/reasons';
import summaryRouteHandlerFiles from '#/modules/summaryRouteHandlerFiles';
import writeOutputFile from '#/modules/writeOutputFile';
import { CE_ROUTE_INFO_KIND } from '#/routes/interface/CE_ROUTE_INFO_KIND';
import type { TPickRouteInfo } from '#/routes/interface/TRouteInfo';
import sortRoutePaths from '#/routes/sortRoutePaths';
import getReasonMessages from '#/tools/getReasonMessages';
import logger from '#/tools/logger';
import chalk from 'chalk';
import fastCopy from 'fast-copy';
import { exists, isDescendant } from 'my-node-fp';
import path from 'path';
import type * as tsm from 'ts-morph';

const log = logger();

export default class WatcherModule {
  #project: tsm.Project;

  #option: TWatchOption;

  constructor(args: { project: tsm.Project; option: TWatchOption }) {
    this.#project = args.project;
    this.#option = args.option;
  }

  async generate(): Promise<TPickRouteInfo<typeof CE_ROUTE_INFO_KIND.ANALYSIS> & { reasons: IReason[] }> {
    spinner.start('find handler files');

    const sourceFilePaths = this.#project
      .getSourceFiles()
      .map((sourceFile) => sourceFile)
      .filter((sourceFile) => isDescendant(this.#option.handler, sourceFile.getFilePath().toString()))
      .filter((sourceFile) => sourceFile.getFilePath().toString() !== getOutputFilePath(this.#option.output))
      .filter((sourceFile) => getHandlerWithOption(sourceFile).handler != null)
      .map((sourceFile) => sourceFile.getFilePath().toString());

    log.debug(`count: ${sourceFilePaths.length}`);

    const handlerMap = await summaryRouteHandlerFiles(sourceFilePaths, this.#option);
    const validationMap = getValidRoutePath(handlerMap);
    const count = Object.values(validationMap.valid).reduce((sum, handlers) => sum + handlers.length, 0);

    log.debug(`count: ${count}`);

    spinner.stop(`handler file searched: ${chalk.cyanBright(count)}`, 'succeed');

    if (count <= 0) {
      throw new Error(
        `Cannot found valid route handler file: ${count}/ ${Object.values(handlerMap.summary).flat().length}`,
      );
    }

    spinner.start(`${count} route configurations generating`);

    const statements = await doAnalysisRequestStatements(this.#project, this.#option, validationMap.valid);

    spinner.stop(`${count} route configurations generated`, 'succeed');

    return {
      imports: statements.imports,
      routes: statements.routes,
      reasons: reasons.reasons,
      kind: CE_ROUTE_INFO_KIND.ANALYSIS,
    };
  }

  async write(statements: IUpdateEvent['statements']) {
    spinner.start('route.ts code generation');

    const sortedRoutes = sortRoutePaths(statements.routes);
    const routeCodes = routeCodeGenerator({ routeConfigurations: sortedRoutes });
    const importCodes = importCodeGenerator({ importConfigurations: statements.imports, option: this.#option });
    const code = getRoutingCode({ option: this.#option, imports: importCodes, routes: routeCodes });
    const prettfied = await prettierProcessing({ code });
    const outputFilePath = getOutputFilePath(this.#option.output);
    await writeOutputFile(outputFilePath, prettfied);

    if (this.#option.routeMap) {
      const routeMapCode = routeMapGenerator(sortedRoutes);
      const routeMapOutputFilePath = getOutputMapFilePath(this.#option.output);
      const prettfiedRouteMapCode = await prettierProcessing({ code: routeMapCode });
      await writeOutputFile(routeMapOutputFilePath, prettfiedRouteMapCode);
    }

    spinner.stop('route.ts code generation', 'succeed');

    show('log', getReasonMessages(reasons.reasons));
    reasons.clear();
  }

  async bulk(events: IWatchEvent[]) {
    const summaries = events.reduce<Record<CE_WATCH_EVENT, Set<string>>>(
      (aggregation, event) => {
        return { ...aggregation, [event.kind]: aggregation[event.kind].add(event.filePath) };
      },
      {
        add: new Set<string>(),
        change: new Set<string>(),
        unlink: new Set<string>(),
      },
    );

    if (Array.from(summaries.add).length > 0) {
      show('log', `${chalk.greenBright('Add')} file: ${Array.from(summaries.add).join(', ')}`);
    }

    if (Array.from(summaries.change).length > 0) {
      show('log', `${chalk.blueBright('Change')} file: ${Array.from(summaries.change).join(', ')}`);
    }

    if (Array.from(summaries.unlink).length > 0) {
      show('log', `${chalk.redBright('Delete')} file: ${Array.from(summaries.unlink).join(', ')}`);
    }

    const summaryReasons = [
      ...(await Promise.all(
        Array.from(summaries.add).map((filePath) => this.add({ kind: CE_WATCH_EVENT.ADD, filePath })),
      )),
      ...(await Promise.all(
        Array.from(summaries.change).map((filePath) => this.change({ kind: CE_WATCH_EVENT.CHANGE, filePath })),
      )),
      ...(await Promise.all(
        Array.from(summaries.unlink).map((filePath) => this.unlink({ kind: CE_WATCH_EVENT.UNLINK, filePath })),
      )),
    ].flat();

    const reply = await this.generate();

    const dedupeReasons = Object.values(
      [...summaryReasons, ...reply.reasons].reduce<Record<string, IReason>>((aggregation, reason) => {
        return { ...aggregation, [`${reason.filePath}::${reason.type}`]: reason };
      }, {}),
    );

    return { ...reply, reasons: [...dedupeReasons, ...reply.reasons] };
  }

  async add(event: IWatchEvent): Promise<IReason[]> {
    const option = fastCopy(this.#option);
    const resolved = path.join(option.cwd, event.filePath);

    if ((await exists(resolved)) === false) {
      return [
        {
          type: 'error',
          message: 'Cannot found add source file',
          filePath: resolved,
        },
      ];
    }

    this.#project.addSourceFileAtPath(resolved);

    return [];
  }

  async change(event: IWatchEvent): Promise<IReason[]> {
    const option = fastCopy(this.#option);
    const resolved = path.join(option.cwd, event.filePath);

    // change event file is tsconfig.json terminate watch process
    const sourceFile = this.#project.getSourceFile(resolved);

    if (sourceFile == null) {
      return [
        {
          type: 'error',
          message: 'Cannot found change source file',
          filePath: resolved,
        },
      ];
    }

    await sourceFile.refreshFromFileSystem();
    return [];
  }

  async unlink(event: IWatchEvent): Promise<IReason[]> {
    const option = fastCopy(this.#option);
    const resolved = path.join(option.cwd, event.filePath);

    log.trace(`received: ${resolved}`);

    const sourceFile = this.#project.getSourceFile(resolved);

    if (sourceFile == null) {
      return [
        {
          type: 'error',
          message: 'Cannot found delete source file',
          filePath: resolved,
        },
      ];
    }

    this.#project.removeSourceFile(sourceFile);
    return [];
  }
}
