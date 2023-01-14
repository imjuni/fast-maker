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

  logbox.config = config;

  try {
    spinner.update(`load tsconfig.json: ${config.project}`);

    const tsProject = await getTypeScriptProject(config.project);

    spinner.update(`load tsconfig.json: ${config.project}`, 'succeed');

    spinner.update('find handler files');

    const stage01Result = await proceedStage01(config.handler, methods);

    spinner.update('find handler files', 'succeed');

    logbox.routeHandlers = stage01Result;

    spinner.stop();

    if (stage01Result.length <= 0) {
      return pass({
        route: {
          importConfigurations: [],
          routeConfigurations: [],
        },
        log: logbox,
      });
    }

    progress.start(stage01Result.length, 0);

    const {
      result: stage02Result,
      reasons: stage02Reasons,
      logObject: analysisLogObject,
    } = await proceedStage02(tsProject, config, stage01Result);

    progress.update(stage01Result.length);
    progress.stop();

    logbox.fileExists = analysisLogObject.fileExists ?? [];
    logbox.fileNotFound = analysisLogObject.fileNotFound ?? [];
    logbox.functionExists = analysisLogObject.functionExists ?? [];
    logbox.functionNotFound = analysisLogObject.functionNotFound ?? [];
    logbox.routePathDuplicate = analysisLogObject.routePathDuplicate ?? [];
    logbox.routePathUnique = analysisLogObject.routePathUnique ?? [];

    spinner.start('route.ts code generation');

    const { importConfigurations, routeConfigurations, reasons: stage03Reasons } = proceedStage03(stage02Result);

    logbox.importConfigurations = importConfigurations;
    logbox.routeConfigurations = routeConfigurations;

    logbox.reasons.push(...stage02Reasons, ...stage03Reasons);

    spinner.update('route.ts code generation', 'succeed');

    return pass({
      route: {
        importConfigurations,
        routeConfigurations,
      },
      log: logbox,
    });
  } catch (catched) {
    const err = catched instanceof Error ? catched : new Error('unknown error raised');

    return fail({ err, log: logbox });
  }
}
