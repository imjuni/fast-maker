import type TMethodType from '#routes/interface/TMethodType';
import type IFailDoWorkReply from '#workers/interfaces/IFailDoWorkReply';
import type IPassDoWorkReply from '#workers/interfaces/IPassDoWorkReply';

class ReplyBoxType {
  accessor passBox: Partial<Record<TMethodType, IPassDoWorkReply>>;

  accessor failBox: Partial<Record<TMethodType, IFailDoWorkReply>>;

  constructor() {
    this.passBox = {};

    this.failBox = {};
  }
}

const replyBox = new ReplyBoxType();

export default replyBox;
