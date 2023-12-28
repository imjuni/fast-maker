import progress from '#/cli/display/progress';
import type { TRouteOption } from '#/configs/interfaces/TRouteOption';
import type { TWatchOption } from '#/configs/interfaces/TWatchOption';
import doAnalysisRequestStatement from '#/modules/doAnalysisRequestStatement';
import doDedupeRouting from '#/modules/doDedupeRouting';
import reasons from '#/modules/reasons';
import type { CE_ROUTE_INFO_KIND } from '#/routes/interface/CE_ROUTE_INFO_KIND';
import type { CE_ROUTE_METHOD } from '#/routes/interface/CE_ROUTE_METHOD';
import type IRouteHandler from '#/routes/interface/IRouteHandler';
import type { TPickRouteInfo } from '#/routes/interface/TRouteInfo';
import type { TPickIFail, TPickIPass } from 'my-only-either';
import type { Project } from 'ts-morph';
import type { AsyncReturnType } from 'type-fest';

export default async function doAnalysisRequestStatements(
  project: Project,
  option: TRouteOption | TWatchOption,
  handlerMap: Record<CE_ROUTE_METHOD, IRouteHandler[]>,
): Promise<TPickRouteInfo<typeof CE_ROUTE_INFO_KIND.ANALYSIS>> {
  const handlers = Object.values(handlerMap).flat();
  const results = await Promise.all(
    handlers.map(async (handler) => {
      const statement = doAnalysisRequestStatement(project, option, handler);
      progress.increment(handler.routePath);
      return statement;
    }),
  );

  const passes = results.filter(
    (result): result is TPickIPass<AsyncReturnType<typeof doAnalysisRequestStatement>> => result.type === 'pass',
  );

  const failes = results.filter(
    (result): result is TPickIFail<AsyncReturnType<typeof doAnalysisRequestStatement>> => result.type === 'fail',
  );

  reasons.add(
    ...[
      ...passes
        .map((passResult) => passResult.pass.reasons)
        .flat()
        .map((reason) => reason.reason),
      ...failes.map((failResult) => failResult.fail.reason),
    ],
  );

  const deduped = doDedupeRouting(passes.map((pass) => pass.pass));

  return deduped;
}
