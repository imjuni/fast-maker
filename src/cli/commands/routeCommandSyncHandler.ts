import { Spinner } from '#/cli/display/Spinner';
import { getTypeScriptProject } from '#/compilers/tools/getTypeScriptProject';
import type { TRouteOption } from '#/configs/interfaces/TRouteOption';
import { routing } from '#/modules/commands/routing';
import { showLogo } from '@maeum/cli-logo';

export async function routeCommandSyncHandler(options: TRouteOption) {
  if (options.cliLogo) {
    await showLogo({ message: 'Fast Maker', figlet: { font: 'ANSI Shadow', width: 80 }, color: 'cyan' });
  } else {
    Spinner.it.start('Fast Maker start');
    Spinner.it.stop('Fast Maker start', 'info');
  }

  Spinner.it.start(`load tsconfig.json: ${options.project}`);

  const project = getTypeScriptProject(options.project);

  Spinner.it.update(`load tsconfig.json: ${options.project}`, 'succeed');

  const routeCode = await routing(options, project);

  console.log(routeCode);
}
