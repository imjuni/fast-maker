import IConfig from '#config/interface/IConfig';
import { existsSync } from 'my-node-fp';
import path from 'path';
import yargs from 'yargs';

export default function isValidConfig(argv: yargs.Arguments<IConfig>) {
  // check project file exits
  const { project } = argv;

  if (existsSync(path.resolve(project)) === false) {
    throw new Error(`Invalid project path: ${path.resolve(project)}`);
  }

  return true;
}
