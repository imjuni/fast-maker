import progress from '#cli/display/progress';
import spinner from '#cli/display/spinner';
import type IConfig from '#configs/interfaces/IConfig';
import type IWatchConfig from '#configs/interfaces/IWatchConfig';
import watchRouting from '#routes/watchRouting';

export default async function watchCommandHandler(config: IConfig & IWatchConfig) {
  progress.enable = true;
  spinner.enable = true;

  watchRouting(config);
}
