import type { CE_SEND_TO_PARENT_COMMAND } from '#workers/interfaces/CE_SEND_TO_PARENT_COMMAND';
import type IFailDoWorkReply from '#workers/interfaces/IFailDoWorkReply';
import type IPassDoWorkReply from '#workers/interfaces/IPassDoWorkReply';

export default interface IFromChildDoWorkReply {
  command: typeof CE_SEND_TO_PARENT_COMMAND.RECEIVE_REPLY;
  data: IPassDoWorkReply | IFailDoWorkReply;
}
