import progress from '#cli/display/progress';
import spinner from '#cli/display/spinner';
import type IConfig from '#config/interface/IConfig';
import importCodeGenerator from '#generator/importCodeGenerator';
import prettierProcessing from '#generator/prettierProcessing';
import routeCodeGenerator from '#generator/routeCodeGenerator';
import getRoutingCode from '#module/getRoutingCode';
import sortRoutes from '#module/sortRoutes';
import generateRouting from '#route/generateRouting';
import methods from '#route/interface/methods';
import getReasonMessages from '#tool/getReasonMessages';
import fs from 'fs';
import { isFail } from 'my-only-either';
import path from 'node:path';

export default async function routeCommandSyncHandler(config: IConfig) {
  progress.enable = true;
  progress.cluster = false;

  spinner.enable = true;
  spinner.cluster = false;

  const routing = await generateRouting(config, methods);

  if (isFail(routing)) {
    if (config.debugLog != null && config.debugLog === false) {
      await fs.promises.writeFile('fast-maker.debug.info.log', routing.fail.log.toString());
    }

    throw routing.fail.err;
  }

  const sortedRoutes = sortRoutes(routing.pass.route.routeConfigurations);

  const routeCodes = routeCodeGenerator({ routeConfigurations: sortedRoutes });
  const importCodes = importCodeGenerator({ importConfigurations: routing.pass.route.importConfigurations, config });

  const code = getRoutingCode({
    config,
    imports: importCodes,
    routes: routeCodes,
  });

  const prettfiedEither = await prettierProcessing({ code });

  if (isFail(prettfiedEither)) {
    if (config.debugLog != null && config.debugLog === false) {
      await fs.promises.writeFile('fast-maker.debug.info.log', routing.pass.log.toString());
    }

    throw prettfiedEither.fail;
  }

  await fs.promises.writeFile(path.join(config.output, 'route.ts'), prettfiedEither.pass);

  console.log(getReasonMessages(routing.pass.log.reasons));

  progress.stop();
  spinner.stop();

  return true;
}
