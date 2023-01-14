import type { CE_SEND_TO_PARENT_COMMAND } from '#worker/interface/CE_SEND_TO_PARENT_COMMAND';
import type IFailDoWorkReply from '#worker/interface/IFailDoWorkReply';
import type IPassDoWorkReply from '#worker/interface/IPassDoWorkReply';

export default interface IFromChildDoWorkReply {
  command: typeof CE_SEND_TO_PARENT_COMMAND.RECEIVE_REPLY;
  data: IPassDoWorkReply | IFailDoWorkReply;
}
