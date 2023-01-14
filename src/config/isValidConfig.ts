import type IConfig from '#config/interface/IConfig';
import { existsSync } from 'my-node-fp';
import path from 'path';
import type { Arguments } from 'yargs';

export default function isValidConfig(argv: Arguments<IConfig>) {
  // check project file exits
  const { project, output } = argv;

  if (existsSync(path.resolve(project)) === false) {
    throw new Error(`Invalid project path: ${path.resolve(project)}`);
  }

  if (existsSync(path.resolve(output)) === false) {
    throw new Error(`Invalid output path: ${path.resolve(output)}`);
  }

  return true;
}
