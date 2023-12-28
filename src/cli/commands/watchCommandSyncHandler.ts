import spinner from '#/cli/display/spinner';
import getTypeScriptProject from '#/compilers/tools/getTypeScriptProject';
import getDiagnostics from '#/compilers/validators/getDiagnostics';
import getResolvedPaths from '#/configs/getResolvedPaths';
import type { TWatchBaseOption, TWatchOption } from '#/configs/interfaces/TWatchOption';
import errorTrace from '#/modules/errorTrace';
import getWatchFiles from '#/modules/getWatchFiles';
import type IWatchEvent from '#/modules/interfaces/IWatchEvent';
import WatcherModule from '#/modules/WatcherModule';
import { showLogo } from '@maeum/cli-logo';
import chokidar from 'chokidar';
import { buffer, debounceTime, Subject } from 'rxjs';

export default async function watchCommandSyncHandler(baseOption: TWatchBaseOption) {
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
  const option: TWatchOption = { ...baseOption, ...resolvedPaths, kind: 'watch' };
  const watchFiles = await getWatchFiles(option);

  spinner.start(`load tsconfig.json: ${option.project}`);

  const project = getTypeScriptProject(option.project);

  spinner.update(`load tsconfig.json: ${option.project}`, 'succeed');

  if (option.skipError === false && getDiagnostics({ option, project }) === false) {
    throw new Error(`Error occur project compile: ${option.project}`);
  }

  const wm = new WatcherModule({ project, option });

  const watchHandle = chokidar.watch(watchFiles, { cwd: option.cwd, ignoreInitial: true });

  const addSubject = new Subject<IWatchEvent>();
  const changeSubject = new Subject<IWatchEvent>();
  const unlinkSubject = new Subject<IWatchEvent>();
  const updateSubject = new Subject<IWatchEvent>();

  const debounceObserable = updateSubject.pipe(debounceTime(1000));

  updateSubject.pipe(buffer(debounceObserable)).subscribe((events) => {
    const handler = async () => {
      const statements = await wm.bulk(events);
      await wm.write(statements);
    };

    handler().catch(errorTrace);
  });

  addSubject.subscribe((change) => updateSubject.next(change));
  changeSubject.subscribe((change) => updateSubject.next(change));
  unlinkSubject.subscribe((change) => updateSubject.next(change));

  watchHandle
    .on('add', (filePath) => addSubject.next({ kind: 'add', filePath }))
    .on('change', (filePath) => changeSubject.next({ kind: 'change', filePath }))
    .on('unlink', (filePath) => unlinkSubject.next({ kind: 'unlink', filePath }));
}
