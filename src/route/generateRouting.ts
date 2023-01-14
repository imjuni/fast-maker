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
  } catch (catched) {
    const err = catched instanceof Error ? catched : new Error('unknown error raised');

    return fail({ err, log: logbox });
  }
}
