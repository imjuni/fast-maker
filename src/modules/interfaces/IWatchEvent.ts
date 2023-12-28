import type { CE_WATCH_EVENT } from '#/modules/interfaces/CE_WATCH_EVENT';

export default interface IWatchEvent {
  /**
   * event kind
   */
  kind: CE_WATCH_EVENT;

  /**
   * file path of event triggered. file path must be a resolved(absolute path)
   */
  filePath: string;
}
