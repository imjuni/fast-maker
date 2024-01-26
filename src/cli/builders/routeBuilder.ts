import type { TRouteOption } from '#/configs/interfaces/TRouteOption';
import type { Argv } from 'yargs';

export function routeBuilder(argv: Argv) {
  return argv as Argv<TRouteOption>;
}
