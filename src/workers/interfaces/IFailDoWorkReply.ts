import type TMethodType from '#routes/interface/TMethodType';
import type ILogBox from '#tools/logging/interface/ILogBox';

export default interface IFailDoWorkReply {
  type: 'fail';
  method: TMethodType;
  log: ILogBox;
  err: Error;
}
