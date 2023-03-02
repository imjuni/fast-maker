import getResolvePath from '#configs/getResolvePath';
import type { TRouteBaseOption } from '#configs/interfaces/TRouteOption';
import type { TWatchBaseOption } from '#configs/interfaces/TWatchOption';
import type { Arguments } from 'yargs';

export default function isValidConfig(argv: Arguments<TRouteBaseOption | TWatchBaseOption>) {
  // check project file exits
  const { project, handler } = argv;

  if (getResolvePath(handler) === false) {
    throw new Error(`Invalid handler path: ${handler}`);
  }

  if (getResolvePath(project) === false) {
    throw new Error(`Invalid project path: ${project}`);
  }

  return true;
}
