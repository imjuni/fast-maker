import progress from '#cli/display/progress';
import spinner from '#cli/display/spinner';
import getTypeScriptProject from '#compiler/tool/getTypeScriptProject';
import type IConfig from '#config/interface/IConfig';
import LogBox from '#module/logging/LogBox';
import proceedStage01 from '#module/proceedStage01';
import proceedStage02 from '#module/proceedStage02';
import proceedStage03 from '#module/proceedStage03';
import type TMethodType from '#route/interface/TMethodType';
import { fail, pass, type PassFailEither } from 'my-only-either';

export default async function generateRouting(
  config: IConfig,
  methods: readonly TMethodType[],
): Promise<
  PassFailEither<
    { log: LogBox; err: Error },
    { route: Omit<ReturnType<typeof proceedStage03>, 'reasons'>; log: LogBox }
  >
> {
  const logbox = new LogBox();

  try {
    spinner.update(`load tsconfig.json: ${config.project}`);

    const tsProject = await getTypeScriptProject(config.project);

    spinner.update('typescript handler source complete, ...');

    const routeHandlers = await proceedStage01(config.handler, methods);

    logbox.config = config;
    logbox.routeHandlers = routeHandlers;

    const {
      routesAnalysised,
      reasons: analysisReasons,
      logObject: analysisLogObject,
    } = await proceedStage02(tsProject, config, routeHandlers);

    logbox.fileExists = analysisLogObject.fileExists ?? [];
    logbox.fileNotFound = analysisLogObject.fileNotFound ?? [];
    logbox.functionExists = analysisLogObject.functionExists ?? [];
    logbox.functionNotFound = analysisLogObject.functionNotFound ?? [];
    logbox.routePathDuplicate = analysisLogObject.routePathDuplicate ?? [];
    logbox.routePathUnique = analysisLogObject.routePathUnique ?? [];

    const {
      importConfigurations,
      routeConfigurations,
      importCodes,
      routeCodes,
      reasons: aggregatedReasons,
    } = proceedStage03(routesAnalysised, config);

    logbox.importConfigurations = importConfigurations;
    logbox.routeConfigurations = routeConfigurations;
    logbox.importCodes = importCodes;
    logbox.routeCodes = routeCodes;

    logbox.reasons.push(...analysisReasons, ...aggregatedReasons);

    return pass({
      route: {
        importConfigurations,
        routeConfigurations,
        importCodes,
        routeCodes,
      },
      log: logbox,
    });

    // const finalCode = [
    //   `import { FastifyInstance } from 'fastify';`,
    //   ...importCodes,
    //   '\n',
    //   `export ${config.useDefaultExport ? 'default ' : ''}function ${
    //     config.routeFunctionName
    //   }(fastify: FastifyInstance): void {`,
    //   ...routeCodes,
    //   `}`,
    // ];

    // logObject.finalCode = importCodes;

    // await writeDebugLog(config, routeConfigurations, logObject);

    // const prettfiedEither = await prettierProcessing({ code: finalCode.join('\n') });

    // log.debug('--------------------------------------------------------');
    // log.debug(prettfiedEither);
    // log.debug('--------------------------------------------------------');

    // if (isFail(prettfiedEither)) {
    //   throw prettfiedEither.fail;
    // }

    // progress.update(routeHandlers.length);

    // return pass({ code: prettfiedEither.pass, reasons: logbox.reasons });
  } catch (catched) {
    const err = catched instanceof Error ? catched : new Error('unknown error raised');

    // logObject.err = {
    //   message: err.message,
    //   stack: err.stack ?? '',
    // };

    // await writeDebugLog(config, [], logObject);

    return fail({ err, log: logbox });
  } finally {
    progress.stop();
  }
}
