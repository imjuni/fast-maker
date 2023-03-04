import type { TWatchOption } from '#configs/interfaces/TWatchOption';
import logger from '#tools/logger';
import chalk from 'chalk';
import chokidar from 'chokidar';
import { isError } from 'my-easy-fp';
import { getDirnameSync, replaceSepToPosix, win32DriveLetterUpdown } from 'my-node-fp';
import path from 'path';
import * as rx from 'rxjs';
import { debounceTime } from 'rxjs/operators';

const log = logger();

export default function watchRouting(config: TWatchOption) {
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

  subject.pipe(debounceTime(watchDebounceTime)).subscribe((changeValue) => {
    try {
      const filePath = path.isAbsolute(changeValue.filePath)
        ? changeValue.filePath
        : replaceSepToPosix(win32DriveLetterUpdown(path.resolve(path.join(cwd, changeValue.filePath)), 'upper'));

      log.debug('file changed: ', filePath);

      //   const routing = await generateRouting(config, methods);

      //   if (isPass(routing)) {
      //     const sorted = sortRoutePaths(routing.pass.route.routeConfigurations);
      //     const routeCodes = routeCodeGenerator({ routeConfigurations: sorted });
      //     const importCodes = importCodeGenerator({
      //       importConfigurations: routing.pass.route.importConfigurations,
      //       option: config,
      //     });

      //     const code = getRoutingCode({
      //       option: config,
      //       imports: importCodes,
      //       routes: routeCodes,
      //     });

      //     const prettfiedEither = await prettierProcessing({ code });

      //     if (prettfiedEither.type === 'pass') {
      //       await fs.promises.writeFile(path.join(config.output, 'route.ts'), prettfiedEither.pass);
      //       // eslint-disable-next-line no-console
      //       console.log(getReasonMessages(routing.pass.log.reasons));
      //     }

      //     log.info('route file generation success!');
      //   }
    } catch (caught) {
      const err = isError(caught) ?? new Error('unknown error raised from watchRouteFile');
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
