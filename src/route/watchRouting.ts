import progress from '#cli/progress';
import spinner from '#cli/spinner';
import IConfig from '#config/interface/IConfig';
import IWatchConfig from '#config/interface/IWatchConfig';
import generateRouting from '#route/generateRouting';
import getReasonMessages from '#tool/getReasonMessages';
import logger from '#tool/logger';
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

export default function watchRouting(
  config: IConfig & IWatchConfig,
  message?: { progress?: boolean; spinner?: boolean; message?: boolean },
) {
  progress.enable = message?.progress ?? false;
  spinner.enable = message?.spinner ?? false;

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

      const generatedCode = await generateRouting(config);

      if (isPass(generatedCode)) {
        await fs.promises.writeFile(path.join(config.output, 'route.ts'), generatedCode.pass.code);
        console.log(getReasonMessages(generatedCode.pass.reasons));

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
