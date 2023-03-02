import type IBaseOption from '#configs/interfaces/IBaseOption';
import type IResolvedPaths from '#configs/interfaces/IResolvedPaths';
import getCwd from '#tools/getCwd';
import { getDirnameSync } from 'my-node-fp';
import path from 'path';
import type { SetOptional } from 'type-fest';

export default function getResolvedPaths(
  option: SetOptional<Pick<IBaseOption, 'project' | 'output' | 'handler'>, 'output'>,
): IResolvedPaths {
  const cwd = getCwd(process.env);
  const project = path.isAbsolute(option.project)
    ? path.resolve(option.project)
    : path.resolve(path.join(cwd, option.project));

  const handler = path.isAbsolute(option.handler)
    ? path.resolve(option.handler)
    : path.resolve(path.join(cwd, option.handler));

  if (option.output != null) {
    const output = path.isAbsolute(option.output)
      ? path.resolve(option.output)
      : path.resolve(path.join(cwd, option.output));

    return { project, cwd, output, handler };
  }

  return { project, cwd, handler, output: getDirnameSync(handler) };
}
