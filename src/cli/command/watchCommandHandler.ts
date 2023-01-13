import progress from '#cli/display/progress';
import spinner from '#cli/display/spinner';
import type IConfig from '#config/interface/IConfig';
import type IWatchConfig from '#config/interface/IWatchConfig';
import watchRouting from '#route/watchRouting';

export default async function watchCommandHandler(config: IConfig & IWatchConfig) {
  progress.enable = true;
  spinner.enable = true;

  watchRouting(config);
}
