import type ILogBox from '#module/logging/interface/ILogBox';
import type proceedStage03 from '#module/proceedStage03';
import type TMethodType from '#route/interface/TMethodType';

export default interface IPassDoWorkReply {
  type: 'pass';
  method: TMethodType;
  pass: { route: Omit<ReturnType<typeof proceedStage03>, 'reasons'>; log: ILogBox };
}
