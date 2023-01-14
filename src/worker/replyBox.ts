import type TMethodType from '#route/interface/TMethodType';
import type IFailDoWorkReply from '#worker/interface/IFailDoWorkReply';
import type IPassDoWorkReply from '#worker/interface/IPassDoWorkReply';

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
