import type IReason from '#/compilers/interfaces/IReason';
import type { CE_WATCH_EVENT } from '#/modules/interfaces/CE_WATCH_EVENT';
import type { CE_ROUTE_INFO_KIND } from '#/routes/const-enum/CE_ROUTE_INFO_KIND';
import type { TPickRouteInfo } from '#/routes/interfaces/TRouteInfo';

export default interface IUpdateEvent {
  /**
   * event kind
   */
  kind: CE_WATCH_EVENT;

  /**
   * file path of event triggered. file path must be a resolved(absolute path)
   */
  statements: TPickRouteInfo<typeof CE_ROUTE_INFO_KIND.ANALYSIS> & { reasons: IReason[] };
}
