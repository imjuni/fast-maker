import IConfig from '@config/interface/IConfig';
import IWatchConfig from '@config/interface/IWatchConfig';
import { Argv } from 'yargs';

export default function builder(args: Argv<IConfig & IWatchConfig>): Argv<IConfig & IWatchConfig> {
  args.option('debounceTime', {
    description: 'watch file debounceTime',
    type: 'number',
    default: 1000,
  });

  return args;
}
