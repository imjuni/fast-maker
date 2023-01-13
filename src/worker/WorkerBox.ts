import type ISendToParent from '#worker/interface/ISendToParent';
import { CE_SEND_TO_PARENT_COMMAND } from '#worker/interface/ISendToParent';
// import TParentToChildData from '#worker/interfaces/TParentToChildData';
import { type Worker } from 'cluster';
import dayjs from 'dayjs';

class WorkerBox {
  #workers: Worker[];

  #finished: number;

  // #records: IDatabaseRecord[];

  constructor() {
    this.#workers = [];
    this.#finished = 0;
  }

  get finished() {
    return this.#finished;
  }

  add(worker: Worker) {
    worker.on('exit', () => {
      this.#finished -= 1;
    });

    worker.on('message', (message: ISendToParent) => {
      if (message.command === CE_SEND_TO_PARENT_COMMAND.PROGRESS_INCREMENT) {
        console.log('increase progress');
      }
    });

    this.#workers.push(worker);
    this.#finished += 1;
  }

  // send(...jobs: TParentToChildData[]) {
  //   jobs.forEach((job, index) => this.#workers[index % this.#workers.length].send(job));
  //   this.#workers.forEach((worker) => worker.send({ command: 'start' }));
  // }

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

const WorkerContainer = new WorkerBox();

export default WorkerContainer;
