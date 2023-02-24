import progress from '#cli/display/progress';
import spinner from '#cli/display/spinner';
import type IConfig from '#configs/interfaces/IConfig';
import importCodeGenerator from '#generators/importCodeGenerator';
import prettierProcessing from '#generators/prettierProcessing';
import routeCodeGenerator from '#generators/routeCodeGenerator';
import getRoutingCode from '#modules/getRoutingCode';
import generateRouting from '#routes/generateRouting';
import methods from '#routes/interface/methods';
import sortRoutePaths from '#routes/sortRoutePaths';
import getReasonMessages from '#tools/getReasonMessages';
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

  const sortedRoutes = sortRoutePaths(routing.pass.route.routeConfigurations);

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

  // eslint-disable-next-line no-console
  console.log(getReasonMessages(routing.pass.log.reasons));

  progress.stop();
  spinner.stop();

  return true;
}
