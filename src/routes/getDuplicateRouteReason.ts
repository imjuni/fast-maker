import type IReason from '#compilers/interfaces/IReason';
import type IRouteHandler from '#routes/interface/IRouteHandler';
import chalk from 'chalk';

export default function getDuplicateRouteReason(handlerFiles: IRouteHandler[]): IReason[] {
  return handlerFiles.map(
    (duplicate) =>
      ({
        type: 'error',
        message: `Found duplicated routePath(${chalk.red(`[${duplicate.method}] ${duplicate.routePath}`)}): ${
          duplicate.filePath
        }`,
        filePath: duplicate.filePath,
      } satisfies IReason),
  );
}
