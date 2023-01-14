import progress from '#cli/display/progress';
import spinner from '#cli/display/spinner';
import { CE_SEND_TO_CHILD_COMMAND } from '#worker/interface/CE_SEND_TO_CHILD_COMMAND';
import type IFromParentDoTerminate from '#worker/interface/IFromParentDoTerminate';
import type IFromParentDoWork from '#worker/interface/IFromParentDoWork';
import doWork from '#worker/module/doWork';
import { EventEmitter } from 'node:events';

export default async function worker() {
  progress.enable = true;
  progress.cluster = true;
  spinner.enable = true;
  spinner.cluster = true;

  const ee = new EventEmitter();

  ee.on(CE_SEND_TO_CHILD_COMMAND.DO_WORK, doWork);

  ee.on(CE_SEND_TO_CHILD_COMMAND.TERMINATE, () => process.exit());

  process.on('SIGTERM', () => process.exit());

  process.on('message', (message: IFromParentDoTerminate | IFromParentDoWork) =>
    ee.emit(message.command, message.data),
  );
}
