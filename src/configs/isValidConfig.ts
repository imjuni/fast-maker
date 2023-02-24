import type IConfig from '#configs/interfaces/IConfig';
import { existsSync } from 'my-node-fp';
import path from 'path';
import type { Arguments } from 'yargs';

export default function isValidConfig(argv: Arguments<IConfig>) {
  // check project file exits
  const { project, handler } = argv;

  if (handler == null || existsSync(path.resolve(handler)) === false) {
    throw new Error(`Invalid handler path: ${handler == null ? handler : path.resolve(handler)}`);
  }

  if (project == null || existsSync(path.resolve(project)) === false) {
    throw new Error(`Invalid project path: ${project == null ? project : path.resolve(project)}`);
  }

  return true;
}
