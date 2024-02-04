import { Progress } from '#/cli/display/Progress';
import { Spinner } from '#/cli/display/Spinner';
import { getInlineExcludedFiles } from '#/compilers/comments/getInlineExcludedFiles';
import { getRouteHandler } from '#/compilers/routes/getRouteHandler';
import { getTypeScriptConfig } from '#/compilers/tools/getTypeScriptConfig';
import { getTypeScriptProject } from '#/compilers/tools/getTypeScriptProject';
import { getDiagnostics } from '#/compilers/validators/getDiagnostics';
import { getResolvedPaths } from '#/configs/getResolvedPaths';
import type { TRouteOption } from '#/configs/interfaces/TRouteOption';
import { appendFastifyInstance } from '#/generators/appendFastifyInstance';
import { dedupeImportConfiguration } from '#/generators/dedupeImportConfiguration';
import { ReasonContainer } from '#/modules/ReasonContainer';
import { getExcludePatterns } from '#/modules/files/getExcludePatterns';
import { getIncludePatterns } from '#/modules/files/getIncludePatterns';
import { ExcludeContainer } from '#/modules/scopes/ExcludeContainer';
import { IncludeContainer } from '#/modules/scopes/IncludeContainer';
import { defaultExclude } from '#/modules/scopes/defaultExclude';
import chalk from 'chalk';
import consola from 'consola';
import { isDescendant } from 'my-node-fp';
import type * as tsm from 'ts-morph';
import type { AsyncReturnType } from 'type-fest';

export async function routing(optionParams: TRouteOption, projectParams?: tsm.Project) {
  Spinner.bootstrap();
  Progress.bootstrap();
  ReasonContainer.bootstrap();

  const project = projectParams ?? getTypeScriptProject(optionParams.project);
  if (optionParams.skipError === false && getDiagnostics({ options: optionParams, project }) === false) {
    throw new Error(`Error occur project compile: ${optionParams.project}`);
  }

  Spinner.it.start('find handler files');

  const tsconfig = await getTypeScriptConfig(optionParams.project);
  const resolvedPaths = await getResolvedPaths(optionParams);
  const filePaths = project.getSourceFiles().map((sourceFile) => sourceFile.getFilePath().toString());
  const options: TRouteOption = { ...optionParams, path: resolvedPaths };

  const includeContainer = new IncludeContainer({
    patterns: getIncludePatterns(options, tsconfig, options.path.projectDir),
    options: { absolute: true, ignore: defaultExclude, cwd: options.path.projectDir },
  });

  const inlineExcludedFiles = getInlineExcludedFiles(project, options.path.projectDir);

  /**
   * SourceCode를 읽어서 inline file exclude 된 파일을 별도로 전달한다. 이렇게 하는 이유는, 이 파일은 왜 포함되지
   * 않았지? 라는 등의 리포트를 생성할 때 한 곳에서 이 정보를 다 관리해야 리포트를 생성해서 보여줄 수 있기 때문이다
   */
  const excludeContainer = new ExcludeContainer({
    patterns: getExcludePatterns(options, tsconfig),
    options: { absolute: true, ignore: defaultExclude, cwd: options.path.projectDir },
    inlineExcludedFiles,
  });

  const projectFilePaths = filePaths
    .filter((filename) => includeContainer.isInclude(filename))
    .filter((filename) => !excludeContainer.isExclude(filename));
  const routeFilePaths = projectFilePaths.filter((filePath) => isDescendant(options.path.handler, filePath));

  if (routeFilePaths.length <= 0) {
    throw new Error(`Cannot found routing files: [${routeFilePaths.length}] ${options.path.handler}`);
  }

  consola.debug(`count: ${routeFilePaths.length}`);

  Spinner.it.stop(`handler file searched: ${chalk.cyanBright(routeFilePaths.length)}`, 'succeed');
  Progress.it.start(routeFilePaths.length, 0);

  const routings = (
    await Promise.all(
      routeFilePaths
        .map((routeFilePath) => project.getSourceFileOrThrow(routeFilePath))
        .map((sourceFile, index) => {
          const result = getRouteHandler(sourceFile, options);
          Progress.it.update(index + 1);
          return result;
        }),
    )
  ).filter((route): route is NonNullable<AsyncReturnType<typeof getRouteHandler>> => route != null);

  const validRoutings = routings.filter((routeConfiguration) => routeConfiguration.valid);

  Progress.it.stop();

  Spinner.it.start('route.ts code generation');

  const importConfigurations = validRoutings.map((route) => route.imports).flat();
  const routeConfigurations = validRoutings.map((route) => route.routes).flat();

  const result = {
    imports: appendFastifyInstance(dedupeImportConfiguration(importConfigurations)),
    routes: routeConfigurations,
  };

  Spinner.it.stop();

  return result;

  /*
  const routeCodes = routeCodeGenerator({ routeConfigurations: sortedRoutes });
  const importCodes = importCodeGenerator({ importConfigurations: statements.imports, option: options });
  const code = getRoutingCode({ option: options, imports: importCodes, routes: routeCodes });
  const prettfied = await prettierProcessing({ code });
  const outputFilePath = getOutputFilePath(options.output);
  await writeOutputFile(outputFilePath, prettfied);

  table.table = createTable(options, handlerMap.summary, sortedRoutes);

  if (options.routeMap) {
    const routeMapCode = routeMapGenerator(sortedRoutes);
    const routeMapOutputFilePath = getOutputMapFilePath(options.output);
    const prettfiedRouteMapCode = await prettierProcessing({ code: routeMapCode });
    await writeOutputFile(routeMapOutputFilePath, prettfiedRouteMapCode);
  }

  spinner.update('route.ts code generation', 'succeed');

  show('log', getReasonMessages(reasons.reasons));
  show('log', table.table.toString());

  progress.stop();
  spinner.stop();

  return true;
  */
}
