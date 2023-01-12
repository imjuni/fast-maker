import progress from '#cli/progress';
import spinner from '#cli/spinner';
import IReason from '#compiler/interface/IReason';
import getTypeScriptProject from '#compiler/tool/getTypeScriptProject';
import IConfig from '#config/interface/IConfig';
import prettierProcessing from '#generator/prettierProcessing';
import getRouteAnalysis from '#module/getRouteAnalysis';
import getWritableCode from '#module/getWritableCode';
import writeDebugLog from '#module/writeDebugLog';
import getRouteFiles from '#route/getRouteFiles';
import logger from '#tool/logger';
import { fail, isFail, pass, PassFailEither } from 'my-only-either';

const log = logger();

export default async function generateRouting(
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
