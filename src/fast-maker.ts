import progress from '#cli/progress';
import spinner from '#cli/spinner';
import IReason from '#compiler/interface/IReason';
import getTypeScriptProject from '#compiler/tool/getTypeScriptProject';
import IConfig from '#config/interface/IConfig';
import IWatchConfig from '#config/interface/IWatchConfig';
import prettierProcessing from '#generator/prettierProcessing';
import getRouteAnalysis from '#module/getRouteAnalysis';
import getWritableCode from '#module/getWritableCode';
import writeDebugLog from '#module/writeDebugLog';
import getRouteFiles from '#route/getRouteFiles';
import logger from '#tool/logger';
import messageDisplay from '#tool/messageDisplay';
import chalk from 'chalk';
import chokidar from 'chokidar';
import fs from 'fs';
import { isError } from 'my-easy-fp';
import { getDirnameSync, replaceSepToPosix, win32DriveLetterUpdown } from 'my-node-fp';
import { fail, isFail, isPass, pass, PassFailEither } from 'my-only-either';
import path from 'path';
import * as rx from 'rxjs';
import { debounceTime } from 'rxjs/operators';

const log = logger();

export async function generateRouteFile(
  config: IConfig,
  message?: { progress?: boolean; spinner?: boolean; message?: boolean },
): Promise<PassFailEither<Error, { code: string; reasons: IReason[] }>> {
  progress.enable = message?.progress ?? false;
  spinner.enable = message?.spinner ?? false;

  const logObject: Record<string, any> = {};

  try {
    spinner.update(`load tsconfig.json: ${config.project}`);

    const tsProject = await getTypeScriptProject(config.project);

    spinner.update('typescript handler source complete, ...');

    const reasons: IReason[] = [];
    const routeHandlers = await getRouteFiles(config.handler);

    logObject.option = config;
    logObject.routeHandlers = routeHandlers;

    const {
      routesAnalysised,
      reasons: analysisReasons,
      logObject: analysisLogObject,
    } = await getRouteAnalysis(tsProject, config, routeHandlers);

    Object.entries(analysisLogObject).forEach(([key, value]) => {
      logObject[key] = value;
    });

    const {
      importConfigurations,
      routeConfigurations,
      importCodes,
      routeCodes,
      reasons: aggregatedReasons,
    } = getWritableCode(routesAnalysised, config);

    logObject.importConfigurations = importConfigurations;
    logObject.routeConfigurations = routeConfigurations;
    logObject.importCodes = importCodes;
    logObject.routeCodes = routeCodes;

    reasons.push(...analysisReasons, ...aggregatedReasons);

    const finalCode = [
      `import { FastifyInstance } from 'fastify';`,
      ...importCodes,
      '\n',
      `export ${config.useDefaultExport ? 'default ' : ''}function ${
        config.routeFunctionName
      }(fastify: FastifyInstance): void {`,
      ...routeCodes,
      `}`,
    ];

    logObject.finalCode = importCodes;

    await writeDebugLog(config, routeConfigurations, logObject);

    const prettfiedEither = await prettierProcessing({ code: finalCode.join('\n') });

    log.debug('--------------------------------------------------------');
    log.debug(prettfiedEither);
    log.debug('--------------------------------------------------------');

    if (isFail(prettfiedEither)) {
      throw prettfiedEither.fail;
    }

    progress.update(routeHandlers.length);

    return pass({ code: prettfiedEither.pass, reasons });
  } catch (catched) {
    const err = catched instanceof Error ? catched : new Error('unknown error raised');

    logObject.err = {
      message: err.message,
      stack: err.stack ?? '',
    };

    await writeDebugLog(config, [], logObject);

    return fail(err);
  } finally {
    progress.stop();
  }
}

export function watchRouteFile(
  config: IConfig & IWatchConfig,
  message?: { progress?: boolean; spinner?: boolean; message?: boolean },
) {
  progress.enable = message?.progress ?? false;
  spinner.enable = message?.spinner ?? false;

  const cwd = replaceSepToPosix(path.resolve(getDirnameSync(config.handler)));
  const watchDebounceTime = config.debounceTime;

  log.info('Route generation watch mode start!');

  const watcher = chokidar.watch(cwd, {
    ignored: [
      /__tests__/,
      /__test__/,
      'interface',
      'interfaces',
      'JSC_*',
      '*.d.ts',
      'node_modules',
      /^\..+/,
      'route.ts',
    ],
    ignoreInitial: true,
    cwd,
  });

  const subject = new rx.Subject<{ type: 'add' | 'change'; filePath: string }>();

  subject.pipe(debounceTime(watchDebounceTime)).subscribe(async (changeValue) => {
    try {
      const filePath = path.isAbsolute(changeValue.filePath)
        ? changeValue.filePath
        : replaceSepToPosix(win32DriveLetterUpdown(path.resolve(path.join(cwd, changeValue.filePath)), 'upper'));

      log.debug('file changed: ', filePath);

      const generatedCode = await generateRouteFile(config);

      if (isPass(generatedCode)) {
        await fs.promises.writeFile(path.join(config.output, 'route.ts'), generatedCode.pass.code);
        messageDisplay(generatedCode.pass.reasons);

        log.info('route file generation success!');
      }
    } catch (catched) {
      const err = isError(catched) ?? new Error('unknown error raised from watchRouteFile');
      log.debug(err);
    }
  });

  watcher
    .on('add', (filePath) => {
      log.info(`file added: ${chalk.yellow(filePath)}`);
      subject.next({ type: 'add', filePath });
    })
    .on('change', (filePath) => {
      log.info(`file changed: ${chalk.yellow(filePath)}`);
      subject.next({ type: 'change', filePath });
    });
}
