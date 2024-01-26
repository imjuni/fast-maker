import type { IBaseOption } from '#/configs/interfaces/IBaseOption';
import type { IResolvedPaths } from '#/configs/interfaces/IResolvedPaths';
import { getCwd } from '#/modules/files/getCwd';
import { getResolvedPath } from '#/modules/files/getResolvedPath';
import { getDirname } from 'my-node-fp';
import type { SetOptional } from 'type-fest';

export async function getResolvedPaths(
  options: SetOptional<Pick<IBaseOption, 'project' | 'output' | 'handler'>, 'output'>,
): Promise<IResolvedPaths> {
  const cwd = getCwd(process.env);
  const project = await getResolvedPath(options.project);
  const projectDir = await getDirname(project);
  const handler = await getResolvedPath(options.handler);

  if (options.output != null) {
    const output = await getResolvedPath(options.output);

    return { project, projectDir, cwd, output, handler };
  }

  return { project, projectDir, cwd, handler, output: await getDirname(handler) };
}
