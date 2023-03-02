import type doDedupeRouting from '#modules/doDedupeRouting';
import type { CE_ROUTE_METHOD } from '#routes/interface/CE_ROUTE_METHOD';

export default interface IPassDoWorkReply {
  type: 'pass';
  method: CE_ROUTE_METHOD;
  pass: { route: ReturnType<typeof doDedupeRouting> };
}
