import createTable from '#/cli/display/createTable';
import progress from '#/cli/display/progress';
import show from '#/cli/display/show';
import spinner from '#/cli/display/spinner';
import getHandlerWithOption from '#/compilers/navigate/getHandlerWithOption';
import getTypeScriptProject from '#/compilers/tools/getTypeScriptProject';
import getDiagnostics from '#/compilers/validators/getDiagnostics';
import getResolvedPaths from '#/configs/getResolvedPaths';
import type { TRouteBaseOption, TRouteOption } from '#/configs/interfaces/TRouteOption';
import importCodeGenerator from '#/generators/importCodeGenerator';
import prettierProcessing from '#/generators/prettierProcessing';
import routeCodeGenerator from '#/generators/routeCodeGenerator';
import routeMapGenerator from '#/generators/routeMapGenerator';
import doAnalysisRequestStatements from '#/modules/doAnalysisRequestStatements';
import getOutputFilePath from '#/modules/getOutputFilePath';
import getOutputMapFilePath from '#/modules/getOutputMapFilePath';
import getRoutingCode from '#/modules/getRoutingCode';
import getValidRoutePath from '#/modules/getValidRoutePath';
import reasons from '#/modules/reasons';
import summaryRouteHandlerFiles from '#/modules/summaryRouteHandlerFiles';
import table from '#/modules/table';
import writeOutputFile from '#/modules/writeOutputFile';
import sortRoutePaths from '#/routes/sortRoutePaths';
import getReasonMessages from '#/tools/getReasonMessages';
import logger from '#/tools/logger';
import { showLogo } from '@maeum/cli-logo';
import chalk from 'chalk';
import { isDescendant } from 'my-node-fp';

const log = logger();

export default async function routeCommandSyncHandler(baseOption: TRouteBaseOption) {
  if (baseOption.cliLogo) {
    await showLogo({
      message: 'Fast Maker',
      figlet: { font: 'ANSI Shadow', width: 80 },
      color: 'cyan',
    });
  } else {
    spinner.start('Fast Maker start');
    spinner.stop('Fast Maker start', 'info');
  }

  const resolvedPaths = getResolvedPaths(baseOption);
  const option: TRouteOption = { ...baseOption, ...resolvedPaths, kind: 'route' };

  spinner.start(`load tsconfig.json: ${option.project}`);

  const project = getTypeScriptProject(option.project);

  spinner.update(`load tsconfig.json: ${option.project}`, 'succeed');

  if (option.skipError === false && getDiagnostics({ option, project }) === false) {
    throw new Error(`Error occur project compile: ${option.project}`);
  }

  spinner.start('find handler files');

  const sourceFilePaths = project
    .getSourceFiles()
    .map((sourceFile) => sourceFile)
    .filter((sourceFile) => isDescendant(option.handler, sourceFile.getFilePath().toString()))
    .filter((sourceFile) => sourceFile.getFilePath().toString() !== getOutputFilePath(option.output))
    .filter((sourceFile) => getHandlerWithOption(sourceFile).handler != null)
    .map((sourceFile) => sourceFile.getFilePath().toString());

  log.debug(`count: ${sourceFilePaths.length}`);

  const handlerMap = await summaryRouteHandlerFiles(sourceFilePaths, option);
  const validationMap = getValidRoutePath(handlerMap);
  const count = Object.values(validationMap.valid).reduce((sum, handlers) => sum + handlers.length, 0);

  log.debug(`count: ${count}`);

  spinner.stop(`handler file searched: ${chalk.cyanBright(count)}`, 'succeed');

  if (count <= 0) {
    throw new Error(
      `Cannot found valid route handler file: ${count}/ ${Object.values(handlerMap.summary).flat().length}`,
    );
  }

  progress.start(count, 0);

  const statements = await doAnalysisRequestStatements(project, option, validationMap.valid);

  progress.update(count);
  progress.stop();

  spinner.start('route.ts code generation');

  const sortedRoutes = sortRoutePaths(statements.routes);
  const routeCodes = routeCodeGenerator({ routeConfigurations: sortedRoutes });
  const importCodes = importCodeGenerator({ importConfigurations: statements.imports, option });
  const code = getRoutingCode({ option, imports: importCodes, routes: routeCodes });
  const prettfied = await prettierProcessing({ code });
  const outputFilePath = getOutputFilePath(option.output);
  await writeOutputFile(outputFilePath, prettfied);

  table.table = createTable(option, handlerMap.summary, sortedRoutes);

  if (option.routeMap) {
    const routeMapCode = routeMapGenerator(sortedRoutes);
    const routeMapOutputFilePath = getOutputMapFilePath(option.output);
    const prettfiedRouteMapCode = await prettierProcessing({ code: routeMapCode });
    await writeOutputFile(routeMapOutputFilePath, prettfiedRouteMapCode);
  }

  spinner.update('route.ts code generation', 'succeed');

  show('log', getReasonMessages(reasons.reasons));
  show('log', table.table.toString());

  progress.stop();
  spinner.stop();

  return true;
}
