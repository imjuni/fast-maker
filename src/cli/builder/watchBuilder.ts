import type IConfig from '#config/interface/IConfig';
import type IWatchConfig from '#config/interface/IWatchConfig';
import type { Argv } from 'yargs';

export default function watchBuilder(args: Argv<IConfig & IWatchConfig>): Argv<IConfig & IWatchConfig> {
  args.option('debounceTime', {
    description: 'watch file debounceTime',
    type: 'number',
    default: 1000,
  });

  return args;
}
