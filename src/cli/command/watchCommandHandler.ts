import type { TWatchOption } from '#configs/interfaces/TWatchOption';
import watchRouting from '#routes/watchRouting';

export default async function watchCommandHandler(option: TWatchOption) {
  watchRouting(option);
}
