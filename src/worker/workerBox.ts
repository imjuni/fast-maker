import progress from '#cli/display/progress';
import logger from '#module/logging/logger';
import { CE_SEND_TO_PARENT_COMMAND } from '#worker/interface/CE_SEND_TO_PARENT_COMMAND';
import type { TFromChild } from '#worker/interface/IFromChild';
import type { TFromParent } from '#worker/interface/IFromParent';
import replyBox from '#worker/replyBox';
import type { Worker } from 'cluster';
import dayjs from 'dayjs';

const log = logger();

class WorkerBoxType {
  #workers: Worker[];

  #finished: number;

  #handlers: number;

  #errors: Error[];

  constructor() {
    this.#workers = [];
    this.#finished = 0;
    this.#handlers = 0;
    this.#errors = [];
  }

  get finished() {
    return this.#finished;
  }

  get handlers() {
    return this.#handlers;
  }

  get errors() {
    return this.#errors;
  }

  add(worker: Worker) {
    worker.on('message', (message: TFromChild) => {
      if (
        message.command === CE_SEND_TO_PARENT_COMMAND.DONE_DO_INIT ||
        message.command === CE_SEND_TO_PARENT_COMMAND.DONE_DO_INIT_PROJECT ||
        message.command === CE_SEND_TO_PARENT_COMMAND.DONE_DO_STAGE01 ||
        message.command === CE_SEND_TO_PARENT_COMMAND.DONE_DO_STAGE02 ||
        message.command === CE_SEND_TO_PARENT_COMMAND.DONE_DO_STAGE03
      ) {
        this.#finished -= 1;

        log.debug(`죽고나서 워커 개수: ${this.#finished}`);
      }

      if (
        message.command === CE_SEND_TO_PARENT_COMMAND.FAIL_DO_INIT_PROJECT ||
        message.command === CE_SEND_TO_PARENT_COMMAND.FAIL_DO_STAGE01 ||
        message.command === CE_SEND_TO_PARENT_COMMAND.FAIL_DO_STAGE02 ||
        message.command === CE_SEND_TO_PARENT_COMMAND.FAIL_DO_STAGE03
      ) {
        this.#errors.push(message.data.err);
        this.#finished -= 1;
      }

      if (message.command === CE_SEND_TO_PARENT_COMMAND.PROGRESS_INCREMENT) {
        progress.forceIncrement();
      }

      if (message.command === CE_SEND_TO_PARENT_COMMAND.DONE_DO_STAGE01) {
        this.#handlers += message.data.handlers;
      }

      if (message.command === CE_SEND_TO_PARENT_COMMAND.DONE_DO_STAGE03) {
        replyBox.passBox[message.data.method] = message.data;
      }
    });

    this.#workers.push(worker);
  }

  send(commands: Array<TFromParent>) {
    commands.forEach((job, index) => {
      this.#workers[index % this.#workers.length].send(job);
      this.#finished += 1;
    });

    log.debug(`활성 워커 개수: ${this.#finished}`);
  }

  broadcast(command: TFromParent) {
    this.#workers.forEach((worker) => worker.send(command));
  }

  wait(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const startAt = dayjs();

      const intervalHandle = setInterval(() => {
        if (this.#finished === 0) {
          clearInterval(intervalHandle);
          resolve(this.#workers.length);
        }

        const currentAt = dayjs();

        // timeout, wait 60 second
        if (currentAt.diff(startAt, 'second') > 20) {
          clearInterval(intervalHandle);
          reject(new Error('timeout wait'));
        }
      }, 300);
    });
  }
}

const workerBox = new WorkerBoxType();

export default workerBox;
