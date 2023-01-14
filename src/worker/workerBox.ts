import logger from '#module/logging/logger';
import { CE_SEND_TO_PARENT_COMMAND } from '#worker/interface/CE_SEND_TO_PARENT_COMMAND';
import type IFromChildDoProgressStart from '#worker/interface/IFromChildDoProgressStart';
import type IFromChildDoProgressStop from '#worker/interface/IFromChildDoProgressStop';
import type IFromChildDoProgressUpdate from '#worker/interface/IFromChildDoProgressUpdate';
import type IFromChildDoSpinnerEnd from '#worker/interface/IFromChildDoSpinnerEnd';
import type IFromChildDoSpinnerStart from '#worker/interface/IFromChildDoSpinnerStart';
import type IFromChildDoSpinnerUpdate from '#worker/interface/IFromChildDoSpinnerUpdate';
import type IFromChildDoWorkReply from '#worker/interface/IFromChildDoWorkReply';
import type IFromParentDoTerminate from '#worker/interface/IFromParentDoTerminate';
import type IFromParentDoWork from '#worker/interface/IFromParentDoWork';
import ParentEventEmitter from '#worker/parent';
import type { Worker } from 'cluster';
import dayjs from 'dayjs';

const log = logger();

type TFromChild =
  | IFromChildDoProgressStop
  | IFromChildDoProgressUpdate
  | IFromChildDoProgressStart
  | IFromChildDoSpinnerStart
  | IFromChildDoSpinnerUpdate
  | IFromChildDoSpinnerEnd
  | IFromChildDoWorkReply;

class WorkerBoxType {
  #workers: Worker[];

  #finished: number;

  #progressIsStart: boolean;

  #progress: {
    total: number;
    report: number;
  };

  #spinnerStart: boolean;

  constructor() {
    this.#workers = [];
    this.#finished = 0;
    this.#progressIsStart = false;
    this.#spinnerStart = false;
    this.#progress = { total: 0, report: 0 };
  }

  get finished() {
    return this.#finished;
  }

  add(worker: Worker) {
    const ee = new ParentEventEmitter();

    worker.on('message', (message: TFromChild) => {
      const next = { ...message };
      log.debug(`왜 안나오지???: ${next.command}`);

      if (next.command === CE_SEND_TO_PARENT_COMMAND.RECEIVE_REPLY) {
        this.#finished -= 1;
        log.debug(`작업 시작 스레드: ${this.#finished}`);
      }

      if (next.command === CE_SEND_TO_PARENT_COMMAND.PROGRESS_START && this.#progressIsStart === true) {
        return;
      }

      if (next.command === CE_SEND_TO_PARENT_COMMAND.PROGRESS_START && this.#progressIsStart === false) {
        log.debug(`바: ${this.#progress.total}/ ${this.#progress.report}/ ${this.#progressIsStart}`);

        this.#progress.total += next.data.total;
        this.#progress.report += 1;

        if (this.#progress.report !== this.#finished) {
          return;
        }

        next.data.total = this.#progress.total;
        this.#progressIsStart = true;
      }

      if (next.command === CE_SEND_TO_PARENT_COMMAND.SPINER_START && this.#spinnerStart === true) {
        return;
      }

      if (next.command === CE_SEND_TO_PARENT_COMMAND.SPINER_START) {
        this.#spinnerStart = true;
      }

      ee.emit(next.command, next);
    });

    this.#workers.push(worker);
  }

  send(...commands: Array<IFromParentDoWork | IFromParentDoTerminate>) {
    commands.forEach((job, index) => {
      this.#workers[index % this.#workers.length].send(job);
      this.#finished += 1;
      log.debug(`작업 시작 스레드: ${this.#finished}`);
    });

    // this.#workers.forEach((worker) => worker.send({ command: 'start' }));
  }

  broadcast(command: IFromParentDoWork | IFromParentDoTerminate) {
    this.#workers.forEach((worker) => worker.send(command));
  }

  wait(): Promise<number> {
    return new Promise<number>((resolve) => {
      const startAt = dayjs();

      const intervalHandle = setInterval(() => {
        if (this.#finished === 0) {
          clearInterval(intervalHandle);
          resolve(this.#workers.length);
        }

        const currentAt = dayjs();

        // timeout, wait 60 second
        if (currentAt.diff(startAt, 'second') > 60) {
          clearInterval(intervalHandle);
          resolve(this.#finished);
        }
      }, 300);
    });
  }
}

const workerBox = new WorkerBoxType();

export default workerBox;
