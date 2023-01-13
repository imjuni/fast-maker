import progress from '#cli/display/progress';
import spinner from '#cli/display/spinner';
import type IConfig from '#config/interface/IConfig';
import prettierProcessing from '#generator/prettierProcessing';
import getRoutingCode from '#module/getRoutingCode';
import generateRouting from '#route/generateRouting';
import methods from '#route/interface/methods';
import getReasonMessages from '#tool/getReasonMessages';
import fs from 'fs';
import { isFail } from 'my-only-either';
import path from 'path';

export default async function routeCommandHandler(config: IConfig) {
  progress.enable = true;
  spinner.enable = true;

  const routing = await generateRouting(config, methods);

  if (isFail(routing)) {
    if (config.debugLog != null && config.debugLog === false) {
      await fs.promises.writeFile('fast-maker.debug.info.log', routing.fail.log.toString());
    }

    throw routing.fail.err;
  }

  const code = getRoutingCode({
    config,
    imports: routing.pass.route.importCodes,
    routes: routing.pass.route.routeCodes,
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
}
