import { Spinner } from '#/cli/display/Spinner';
import { createTable } from '#/cli/display/createTable';
import { show } from '#/cli/display/show';
import { getTypeScriptProject } from '#/compilers/tools/getTypeScriptProject';
import type { TRouteOption } from '#/configs/interfaces/TRouteOption';
import { routing } from '#/modules/commands/routing';
import { TemplateContainer } from '#/template/TemplateContainer';
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
  await TemplateContainer.bootstrap();

  Spinner.it.update(`load tsconfig.json: ${options.project}`, 'succeed');

  const routings = await routing(options, project);
  const evaluated = await TemplateContainer.it.evaluate('routing', routings);

  show('log', evaluated);

  const table = createTable(routings.routes);
  show('log', table.toString());
}
