import type { CE_ROUTE_METHOD } from '#routes/interface/CE_ROUTE_METHOD';
import type IFailDoWorkReply from '#workers/interfaces/IFailDoWorkReply';
import type IPassDoWorkReply from '#workers/interfaces/IPassDoWorkReply';

class ReplyBoxType {
  accessor passBox: Partial<Record<CE_ROUTE_METHOD, IPassDoWorkReply>>;

  accessor failBox: Partial<Record<CE_ROUTE_METHOD, IFailDoWorkReply>>;

  constructor() {
    this.passBox = {};

    this.failBox = {};
  }
}

const replyBox = new ReplyBoxType();

export default replyBox;
