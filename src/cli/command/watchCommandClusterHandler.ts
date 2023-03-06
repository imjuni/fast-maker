import spinner from '#cli/display/spinner';
import getResolvedPaths from '#configs/getResolvedPaths';
import type { TWatchOption } from '#configs/interfaces/TWatchOption';
import FastMakerError from '#errors/FastMakerError';
import errorTrace from '#modules/errorTrace';
import getWatchFiles from '#modules/getWatchFiles';
import type IWatchEvent from '#modules/interfaces/IWatchEvent';
import WatcherClusterModule from '#modules/WatcherClusterModule';
import { CE_WORKER_ACTION } from '#workers/interfaces/CE_WORKER_ACTION';
import type TSendMasterToWorkerMessage from '#workers/interfaces/TSendMasterToWorkerMessage';
import { isFailTaskComplete } from '#workers/interfaces/TSendWorkerToMasterMessage';
import workers from '#workers/workers';
import { showLogo } from '@maeum/cli-logo';
import chokidar from 'chokidar';
import { atOrThrow, populate } from 'my-easy-fp';
import cluster from 'node:cluster';
import os from 'node:os';
import { buffer, debounceTime, Subject } from 'rxjs';

export default async function watchCommandClusterHandler(baseOption: TWatchOption) {
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

  const workerSize = baseOption.maxWorkers ?? os.cpus().length - 1;
  populate(workerSize).forEach(() => workers.add(cluster.fork()));

  spinner.start(`TypeScript project loading: ${resolvedPaths.project}`);

  workers.broadcast({
    command: CE_WORKER_ACTION.OPTION_LOAD,
    data: { option },
  } satisfies Extract<TSendMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.OPTION_LOAD }>);

  await workers.wait();

  workers.broadcast({
    command: CE_WORKER_ACTION.PROJECT_LOAD,
  } satisfies Extract<TSendMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.PROJECT_LOAD }>);

  let reply = await workers.wait(option.workerTimeout);

  await workers.wait();

  // master check project loading on worker
  if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
    const failReplies = reply.data.filter(isFailTaskComplete);
    const failReply = atOrThrow(failReplies, 0);
    throw new FastMakerError(failReply.error);
  }

  workers.send({
    command: CE_WORKER_ACTION.PROJECT_DIAGONOSTIC,
  } satisfies Extract<TSendMasterToWorkerMessage, { command: typeof CE_WORKER_ACTION.PROJECT_DIAGONOSTIC }>);

  reply = await workers.wait();

  // master check project diagostic on worker
  if (reply.data.some((workerReply) => workerReply.result === 'fail')) {
    const failReplies = reply.data.filter(isFailTaskComplete);
    const failReply = atOrThrow(failReplies, 0);
    throw new FastMakerError(failReply.error);
  }

  spinner.stop(`TypeScript project loaded: ${resolvedPaths.project}`, 'succeed');

  const wm = new WatcherClusterModule({ option, workerSize });

  const watchHandle = chokidar.watch(watchFiles, { cwd: option.cwd, ignoreInitial: true });

  const addSubject = new Subject<IWatchEvent>();
  const changeSubject = new Subject<IWatchEvent>();
  const unlinkSubject = new Subject<IWatchEvent>();
  const updateSubject = new Subject<IWatchEvent>();

  const debounceObserable = updateSubject.pipe(debounceTime(1000));

  const handler = async (events: IWatchEvent[]) => {
    const statements = await wm.bulk(events);
    await wm.write(statements);
  };

  updateSubject.pipe(buffer(debounceObserable)).subscribe((events) => {
    handler(events).catch(errorTrace);
  });

  addSubject.subscribe((change) => updateSubject.next(change));
  changeSubject.subscribe((change) => updateSubject.next(change));
  unlinkSubject.subscribe((change) => updateSubject.next(change));

  watchHandle
    .on('add', (filePath) => addSubject.next({ kind: 'add', filePath }))
    .on('change', (filePath) => changeSubject.next({ kind: 'change', filePath }))
    .on('unlink', (filePath) => unlinkSubject.next({ kind: 'unlink', filePath }));
}
