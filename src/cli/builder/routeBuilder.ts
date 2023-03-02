import type { TRouteOption } from '#configs/interfaces/TRouteOption';
import type { Argv } from 'yargs';

export default function routeBuilder(argv: Argv) {
  return argv as Argv<TRouteOption>;
}
