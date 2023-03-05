import progress from '#cli/display/progress';
import show from '#cli/display/show';
import spinner from '#cli/display/spinner';
import getHandlerWithOption from '#compilers/navigate/getHandlerWithOption';
import getTypeScriptProject from '#compilers/tools/getTypeScriptProject';
import getResolvedPaths from '#configs/getResolvedPaths';
import type { TRouteBaseOption, TRouteOption } from '#configs/interfaces/TRouteOption';
import importCodeGenerator from '#generators/importCodeGenerator';
import prettierProcessing from '#generators/prettierProcessing';
import routeCodeGenerator from '#generators/routeCodeGenerator';
import doAnalysisRequestStatements from '#modules/doAnalysisRequestStatements';
import getOutputFilePath from '#modules/getOutputFilePath';
import getRoutingCode from '#modules/getRoutingCode';
import getValidRoutePath from '#modules/getValidRoutePath';
import reasons from '#modules/reasons';
import summaryRouteHandlerFiles from '#modules/summaryRouteHandlerFiles';
import writeOutputFile from '#modules/writeOutputFile';
import sortRoutePaths from '#routes/sortRoutePaths';
import getReasonMessages from '#tools/getReasonMessages';
import logger from '#tools/logger';
import { isDescendant } from 'my-node-fp';

const log = logger();

export default async function routeCommandSyncHandler(baseOption: TRouteBaseOption) {
  const resolvedPaths = getResolvedPaths(baseOption);
  const option: TRouteOption = { ...baseOption, ...resolvedPaths };

  spinner.update(`load tsconfig.json: ${option.project}`);

  const project = await new Promise<ReturnType<typeof getTypeScriptProject>>((resolve) => {
    setImmediate(() => resolve(getTypeScriptProject(option.project)));
  });

  spinner.update(`load tsconfig.json: ${option.project}`, 'succeed');

  spinner.update('find handler files');

  const sourceFilePaths = project
    .getSourceFiles()
    .map((sourceFile) => sourceFile)
    .filter((sourceFile) => isDescendant(option.handler, sourceFile.getFilePath().toString()))
    .filter((sourceFile) => getHandlerWithOption(sourceFile).handler != null)
    .map((sourceFile) => sourceFile.getFilePath().toString());

  log.debug(`count: ${sourceFilePaths.length}`);

  const handlerMap = await summaryRouteHandlerFiles(sourceFilePaths, option);

  spinner.update('find handler files', 'succeed');

  const validationMap = getValidRoutePath(handlerMap);

  spinner.stop();

  const count = Object.values(validationMap.valid).reduce((sum, handlers) => sum + handlers.length, 0);

  log.debug(`count: ${count}`);

  if (count <= 0) {
    return false;
  }

  progress.start(count, 0);

  const statements = await doAnalysisRequestStatements(project, option, validationMap.valid);

  progress.update(count);
  progress.stop();

  spinner.start('route.ts code generation');

  const routeCodes = routeCodeGenerator({ routeConfigurations: sortRoutePaths(statements.routes) });
  const importCodes = importCodeGenerator({ importConfigurations: statements.imports, option });
  const code = getRoutingCode({ option, imports: importCodes, routes: routeCodes });
  const prettfied = await prettierProcessing({ code });
  const outputFilePath = getOutputFilePath(option.output);

  await writeOutputFile(outputFilePath, prettfied);

  spinner.update('route.ts code generation', 'succeed');

  show('log', getReasonMessages(reasons.reasons));

  progress.stop();
  spinner.stop();

  return true;
}
