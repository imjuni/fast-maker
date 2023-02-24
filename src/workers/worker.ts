import progress from '#cli/display/progress';
import spinner from '#cli/display/spinner';
import logger from '#tools/logging/logger';
import { CE_SEND_TO_CHILD_COMMAND } from '#workers/interfaces/CE_SEND_TO_CHILD_COMMAND';
import type { TFromParent } from '#workers/interfaces/IFromParent';
import ChildEventEmitter from '#workers/modules/ChildEventEmitter';

const log = logger();

export default async function worker() {
  progress.enable = true;
  progress.cluster = true;
  spinner.enable = true;
  spinner.cluster = true;

  const ee = new ChildEventEmitter();

  ee.on(CE_SEND_TO_CHILD_COMMAND.TERMINATE, () => process.exit());

  process.on('SIGTERM', () => process.exit());

  process.on('message', async (message: TFromParent) => {
    log.debug(`메시지를 실행한다: ${message.command}`);
    ee.emit(message.command, message);
  });
}
