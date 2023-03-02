import progress from '#cli/display/progress';
import show from '#cli/display/show';
import spinner from '#cli/display/spinner';
import getTypeScriptProject from '#compilers/tools/getTypeScriptProject';
import getResolvedPaths from '#configs/getResolvedPaths';
import type { TRouteBaseOption, TRouteOption } from '#configs/interfaces/TRouteOption';
import importCodeGenerator from '#generators/importCodeGenerator';
import prettierProcessing from '#generators/prettierProcessing';
import routeCodeGenerator from '#generators/routeCodeGenerator';
import doDedupeRouting from '#modules/doDedupeRouting';
import doMethodAggregator from '#modules/doMethodAggregator';
import doStateMachine from '#modules/doStateMachine';
import getRoutingCode from '#modules/getRoutingCode';
import getValidRoutePath from '#modules/getValidRoutePath';
import reasons from '#modules/reasons';
import sortRoutePaths from '#routes/sortRoutePaths';
import getReasonMessages from '#tools/getReasonMessages';
import logger from '#tools/logging/logger';
import fs from 'fs';
import path from 'node:path';

const log = logger();

export default async function routeCommandSyncHandler(baseOption: TRouteBaseOption) {
  const resolvedPaths = getResolvedPaths(baseOption);
  const option: TRouteOption = { ...baseOption, ...resolvedPaths };

  spinner.update(`load tsconfig.json: ${option.project}`);

  const project = await getTypeScriptProject(option.project);

  spinner.update(`load tsconfig.json: ${option.project}`, 'succeed');

  spinner.update('find handler files');

  const sourceFilePaths = project.getSourceFiles().map((sourceFile) => sourceFile.getFilePath());

  log.debug(`count: ${sourceFilePaths.length}`);

  const handlerMap = await doMethodAggregator(sourceFilePaths, option);

  spinner.update('find handler files', 'succeed');

  const validationMap = getValidRoutePath(handlerMap);

  spinner.stop();

  const count = Object.values(validationMap.valid).reduce((sum, handlers) => sum + handlers.length, 0);

  log.debug(`count: ${count}`);

  if (count <= 0) {
    return false;
  }

  progress.start(count, 0);

  const stateMachineApplied = await doStateMachine(project, option, handlerMap);

  progress.update(count);
  progress.stop();

  spinner.start('route.ts code generation');

  const { importConfigurations, routeConfigurations } = doDedupeRouting(stateMachineApplied);

  spinner.update('route.ts code generation', 'succeed');

  const routeCodes = routeCodeGenerator({ routeConfigurations: sortRoutePaths(routeConfigurations) });
  const importCodes = importCodeGenerator({ importConfigurations, option });

  const code = getRoutingCode({ config: option, imports: importCodes, routes: routeCodes });

  const prettfied = await prettierProcessing({ code });

  await fs.promises.writeFile(path.join(option.output, 'route.ts'), prettfied);

  show(getReasonMessages(reasons.reasons));

  progress.stop();
  spinner.stop();

  return true;
}
