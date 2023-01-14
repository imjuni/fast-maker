import type IConfig from '#config/interface/IConfig';
import type TMethodType from '#route/interface/TMethodType';
import type { CE_SEND_TO_CHILD_COMMAND } from '#worker/interface/CE_SEND_TO_CHILD_COMMAND';

export default interface IFromParentDoWork {
  command: typeof CE_SEND_TO_CHILD_COMMAND.DO_WORK;
  data: {
    config: IConfig;
    method: TMethodType;
  };
}
