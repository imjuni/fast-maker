import type IConfig from '#configs/interfaces/IConfig';
import type IWatchConfig from '#configs/interfaces/IWatchConfig';
import importCodeGenerator from '#generators/importCodeGenerator';
import prettierProcessing from '#generators/prettierProcessing';
import routeCodeGenerator from '#generators/routeCodeGenerator';
import getRoutingCode from '#modules/getRoutingCode';
import generateRouting from '#routes/generateRouting';
import methods from '#routes/interface/methods';
import sortRoutePaths from '#routes/sortRoutePaths';
import getReasonMessages from '#tools/getReasonMessages';
import logger from '#tools/logging/logger';
import chalk from 'chalk';
import chokidar from 'chokidar';
import fs from 'fs';
import { isError } from 'my-easy-fp';
import { getDirnameSync, replaceSepToPosix, win32DriveLetterUpdown } from 'my-node-fp';
import { isPass } from 'my-only-either';
import path from 'path';
import * as rx from 'rxjs';
import { debounceTime } from 'rxjs/operators';

const log = logger();

export default function watchRouting(config: IConfig & IWatchConfig) {
  const cwd = replaceSepToPosix(path.resolve(getDirnameSync(config.handler)));
  const watchDebounceTime = config.debounceTime;

  log.info('Route generation watch mode start!');

  const watcher = chokidar.watch(cwd, {
    ignored: [
      /__tests__/,
      /__test__/,
      'interface',
      'interfaces',
      'JSC_*',
      '*.d.ts',
      'node_modules',
      /^\..+/,
      'route.ts',
    ],
    ignoreInitial: true,
    cwd,
  });

  const subject = new rx.Subject<{ type: 'add' | 'change'; filePath: string }>();

  subject.pipe(debounceTime(watchDebounceTime)).subscribe(async (changeValue) => {
    try {
      const filePath = path.isAbsolute(changeValue.filePath)
        ? changeValue.filePath
        : replaceSepToPosix(win32DriveLetterUpdown(path.resolve(path.join(cwd, changeValue.filePath)), 'upper'));

      log.debug('file changed: ', filePath);

      const routing = await generateRouting(config, methods);

      if (isPass(routing)) {
        const sorted = sortRoutePaths(routing.pass.route.routeConfigurations);
        const routeCodes = routeCodeGenerator({ routeConfigurations: sorted });
        const importCodes = importCodeGenerator({
          importConfigurations: routing.pass.route.importConfigurations,
          config,
        });

        const code = getRoutingCode({
          config,
          imports: importCodes,
          routes: routeCodes,
        });

        const prettfiedEither = await prettierProcessing({ code });

        if (prettfiedEither.type === 'pass') {
          await fs.promises.writeFile(path.join(config.output, 'route.ts'), prettfiedEither.pass);
          // eslint-disable-next-line no-console
          console.log(getReasonMessages(routing.pass.log.reasons));
        }

        log.info('route file generation success!');
      }
    } catch (catched) {
      const err = isError(catched) ?? new Error('unknown error raised from watchRouteFile');
      log.debug(err);
    }
  });

  watcher
    .on('add', (filePath) => {
      log.info(`file added: ${chalk.yellow(filePath)}`);
      subject.next({ type: 'add', filePath });
    })
    .on('change', (filePath) => {
      log.info(`file changed: ${chalk.yellow(filePath)}`);
      subject.next({ type: 'change', filePath });
    });
}
