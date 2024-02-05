import { createTable } from '#/cli/display/createTable2';
import { show } from '#/cli/display/show';
import { Spinner } from '#/cli/display/spinner2';
import { getTypeScriptProject } from '#/compilers/tools/getTypeScriptProject';
import type { TRouteOption } from '#/configs/interfaces/TRouteOption';
import { prettierProcessing } from '#/generators/prettierProcessing';
import { routeMapTransform } from '#/generators/routeMapTransform';
import { ReasonContainer } from '#/modules/ReasonContainer';
import { routing } from '#/modules/commands/routing';
import { getOutputFilePath } from '#/modules/getOutputFilePath';
import { writeOutputFile } from '#/modules/writeOutputFile';
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
  const routeEvaluated = await TemplateContainer.it.evaluate('routing', routings);
  const prettfiedRouteCode = await prettierProcessing({ code: routeEvaluated });
  const outputFilePath = getOutputFilePath('route.ts', options.output);
  await writeOutputFile(outputFilePath, prettfiedRouteCode);

  if (options.routeMap) {
    const routeMapEvaluated = await TemplateContainer.it.evaluate('route-map', {
      routes: routeMapTransform(routings.routes),
    });
    const prettfiedRouteMapCode = await prettierProcessing({ code: routeMapEvaluated });
    const outputMapFilePath = getOutputFilePath('route-map.ts', options.output);
    await writeOutputFile(outputMapFilePath, prettfiedRouteMapCode);
  }

  const table = createTable(routings.routes);

  if (routings.reasons.length > 0) {
    ReasonContainer.it.add(...ReasonContainer.aggregate(routings.reasons));
    show('log', ReasonContainer.it.show());
  }

  show('log', table.toString());
}
