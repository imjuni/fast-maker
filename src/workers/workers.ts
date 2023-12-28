import progress from '#/cli/display/progress';
import { CE_DEFAULT_VALUE } from '#/configs/interfaces/CE_DEFAULT_VALUE';
import logger from '#/tools/logger';
import type { CE_MASTER_ACTION } from '#/workers/interfaces/CE_MASTER_ACTION';
import { CE_WORKER_ACTION } from '#/workers/interfaces/CE_WORKER_ACTION';
import type TSendMasterToWorkerMessage from '#/workers/interfaces/TSendMasterToWorkerMessage';
import type TSendWorkerToMasterMessage from '#/workers/interfaces/TSendWorkerToMasterMessage';
import type { IFailWorkerToMasterTaskComplete } from '#/workers/interfaces/TSendWorkerToMasterMessage';
import type { Worker } from 'cluster';
import dayjs from 'dayjs';
import fastCopy from 'fast-copy';
import { atOrUndefined } from 'my-easy-fp';

const log = logger();

class WorkerBoxType {
  #workers: Worker[];

  #finished: number;

  #reply: Extract<TSendWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>['data'][];

  constructor() {
    this.#workers = [];
    this.#finished = 0;
    this.#reply = [];
  }

  get finished() {
    return this.#finished;
  }

  inc() {
    this.#finished += 1;
  }

  dec() {
    this.#finished -= 1;
  }

  add(worker: Worker) {
    worker.on('message', (message: TSendWorkerToMasterMessage) => {
      if (message.command === 'progress-update') {
        progress.increment(message.data.routeFile);
        return;
      }

      this.#reply.push(message.data);
      this.dec();
      log.trace(`received: ${this.finished} ${message.command}>${message.data.command}`);
    });

    this.#workers.push(worker);
  }

  send(...jobs: TSendMasterToWorkerMessage[]) {
    this.#reply = [];

    jobs.forEach((job, index, arr) => {
      const pos = index % Object.keys(this.#workers).length;
      this.#workers[pos]?.send(job);
      this.inc();
      log.trace(`send[${this.#finished}][${index}/${arr.length}]: ${this.#workers[pos]?.id ?? 'N/A'}`);
    });
  }

  broadcast(job: TSendMasterToWorkerMessage) {
    this.#reply = [];

    this.#workers.forEach((worker, index, arr) => {
      worker.send(job);
      this.inc();
      log.trace(`sendAll[${this.#finished}][${index}/${arr.length}]: ${worker.id}`);
    });
  }

  wait(waitSecond?: number) {
    return new Promise<{
      cluster: number;
      data: Extract<TSendWorkerToMasterMessage, { command: typeof CE_MASTER_ACTION.TASK_COMPLETE }>['data'][];
    }>((resolve) => {
      const startAt = dayjs();

      const intervalHandle = setInterval(() => {
        if (this.#finished === 0) {
          clearInterval(intervalHandle);

          const result = fastCopy(this.#reply);
          this.#reply = [];

          resolve({ cluster: this.#finished, data: result });
        }

        const currentAt = dayjs();

        // timeout, wait 30 second
        if (currentAt.diff(startAt, 'seconds') > (waitSecond ?? CE_DEFAULT_VALUE.DEFAULT_TASK_WAIT_SECOND)) {
          clearInterval(intervalHandle);

          const err = new Error('exceeded generator-timeout option');
          const result = [
            {
              command: atOrUndefined(this.#reply, 0)?.command ?? CE_WORKER_ACTION.NOOP,
              result: 'fail',
              id: atOrUndefined(this.#reply, 0)?.id ?? -1,
              error: {
                kind: 'error',
                message: err.message,
                stack: err.stack,
              },
            } satisfies IFailWorkerToMasterTaskComplete,
            ...fastCopy(this.#reply),
          ];

          this.#reply = [];

          resolve({ cluster: this.#finished, data: result });
        }
      }, 200);
    });
  }
}

const workerBox = new WorkerBoxType();

export default workerBox;
