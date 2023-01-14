import progress from '#cli/display/progress';
import spinner from '#cli/display/spinner';
import logger from '#module/logging/logger';
import loseAbleStringfiy from '#tool/loseAbleStringfiy';
import { CE_SEND_TO_PARENT_COMMAND } from '#worker/interface/CE_SEND_TO_PARENT_COMMAND';
import type IFromChildDoProgressStart from '#worker/interface/IFromChildDoProgressStart';
import type IFromChildDoProgressUpdate from '#worker/interface/IFromChildDoProgressUpdate';
import type IFromChildDoSpinnerStart from '#worker/interface/IFromChildDoSpinnerStart';
import type IFromChildDoSpinnerUpdate from '#worker/interface/IFromChildDoSpinnerUpdate';
import type IFromChildDoWorkReply from '#worker/interface/IFromChildDoWorkReply';
import replyBox from '#worker/replyBox';
import EventEmitter from 'node:events';

const log = logger();

export default class ParentEventEmitter extends EventEmitter {
  constructor() {
    super();

    this.on(CE_SEND_TO_PARENT_COMMAND.PROGRESS_INCREMENT, () => {
      progress.forceIncrement();
    });

    this.on(CE_SEND_TO_PARENT_COMMAND.PROGRESS_START, (data: IFromChildDoProgressStart) => {
      progress.forceStart(data.data.total, data.data.startValue);
    });

    this.on(CE_SEND_TO_PARENT_COMMAND.PROGRESS_INCREMENT, () => {
      progress.forceIncrement();
    });

    this.on(CE_SEND_TO_PARENT_COMMAND.PROGRESS_UPDATE, (data: IFromChildDoProgressUpdate) => {
      progress.forceUpdate(data.data.updateValue);
    });

    this.on(CE_SEND_TO_PARENT_COMMAND.PROGRESS_STOP, () => {
      progress.forceStop();
    });

    this.on(CE_SEND_TO_PARENT_COMMAND.SPINER_START, (data: IFromChildDoSpinnerStart) => {
      spinner.forceStart(data.data.message);
    });

    this.on(CE_SEND_TO_PARENT_COMMAND.SPINER_UPDATE, (data: IFromChildDoSpinnerUpdate) => {
      log.debug(`메시지 업데이트: ${loseAbleStringfiy(data)}`);
      spinner.forceUpdate(data.data.message, data.data.type);
    });

    this.on(CE_SEND_TO_PARENT_COMMAND.SPINER_END, () => {
      spinner.forceStop();
    });

    this.on(CE_SEND_TO_PARENT_COMMAND.RECEIVE_REPLY, (data: IFromChildDoWorkReply) => {
      if (data.data.type === 'fail') {
        replyBox.failBox[data.data.method] = data.data;
      } else {
        replyBox.passBox[data.data.method] = data.data;
      }
    });
  }
}
