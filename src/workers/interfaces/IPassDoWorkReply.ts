import type proceedStage03 from '#modules/proceedStage03';
import type TMethodType from '#routes/interface/TMethodType';
import type ILogBox from '#tools/logging/interface/ILogBox';

export default interface IPassDoWorkReply {
  type: 'pass';
  method: TMethodType;
  pass: { route: Omit<ReturnType<typeof proceedStage03>, 'reasons'>; log: ILogBox };
}
