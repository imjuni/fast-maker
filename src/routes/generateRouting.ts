import progress from '#cli/display/progress';
import spinner from '#cli/display/spinner';
import type IReason from '#compilers/interfaces/IReason';
import getTypeScriptProject from '#compilers/tools/getTypeScriptProject';
import type { TRouteOption } from '#configs/interfaces/TRouteOption';
import type { TWatchOption } from '#configs/interfaces/TWatchOption';
import doDedupeRouting from '#modules/doDedupeRouting';
import doMethodAggregator from '#modules/doMethodAggregator';
import doStateMachine from '#modules/doStateMachine';
import getValidRoutePath from '#modules/getValidRoutePath';
import reasons from '#modules/reasons';
import chalk from 'chalk';
import { fail, pass, type PassFailEither } from 'my-only-either';

export default async function generateRouting(
  option: TRouteOption | TWatchOption,
): Promise<PassFailEither<{ err: Error }, { route: Omit<ReturnType<typeof doDedupeRouting>, 'reasons'> }>> {
  try {
    spinner.update(`load tsconfig.json: ${option.project}`);

    const project = await getTypeScriptProject(option.project);

    spinner.update(`load tsconfig.json: ${option.project}`, 'succeed');

    spinner.update('find handler files');

    const sourceFilePaths = project.getSourceFiles().map((sourceFile) => sourceFile.getFilePath());

    const handlerMap = await doMethodAggregator(sourceFilePaths, option);

    spinner.update('find handler files', 'succeed');

    const validationMap = getValidRoutePath(handlerMap);

    reasons.add(
      ...validationMap.duplicate.map((duplicate) => {
        return {
          type: 'error',
          message: `Found duplicated routePath(${chalk.red(`[${duplicate.method}] ${duplicate.routePath}`)}): ${
            duplicate.filePath
          }`,
          filePath: duplicate.filePath,
        } satisfies IReason;
      }),
    );

    spinner.stop();

    const count = Object.values(validationMap.valid).reduce((sum, handlers) => sum + handlers.length, 0);

    if (count <= 0) {
      return pass({
        route: {
          importConfigurations: [],
          routeConfigurations: [],
        },
      });
    }

    progress.start(count, 0);

    const stateMachineApplied = await doStateMachine(project, option, handlerMap);

    progress.update(count);
    progress.stop();

    spinner.start('route.ts code generation');

    const { importConfigurations, routeConfigurations } = doDedupeRouting(stateMachineApplied);

    spinner.update('route.ts code generation', 'succeed');

    return pass({
      route: {
        importConfigurations,
        routeConfigurations,
      },
    });
  } catch (catched) {
    const err = catched instanceof Error ? catched : new Error('unknown error raised');

    return fail({ err });
  }
}
