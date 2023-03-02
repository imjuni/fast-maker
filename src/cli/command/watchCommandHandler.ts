import progress from '#cli/display/progress';
import spinner from '#cli/display/spinner';
import type { TWatchOption } from '#configs/interfaces/TWatchOption';
import watchRouting from '#routes/watchRouting';

export default async function watchCommandHandler(option: TWatchOption) {
  progress.isEnable = true;
  spinner.isEnable = true;

  watchRouting(option);
}
