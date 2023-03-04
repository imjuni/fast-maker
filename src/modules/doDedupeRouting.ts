import type IImportConfiguration from '#compilers/interfaces/IImportConfiguration';
import dedupeImportConfiguration from '#generators/dedupeImportConfiguration';
import type doAnalysisRequestStatement from '#modules/doAnalysisRequestStatement';
import { CE_ROUTE_INFO_KIND } from '#routes/interface/CE_ROUTE_INFO_KIND';
import type IRouteConfiguration from '#routes/interface/IRouteConfiguration';
import type { TPickRouteInfo } from '#routes/interface/TRouteInfo';
import type { TPickPass } from 'my-only-either';
import type { AsyncReturnType } from 'type-fest';

export default function doDedupeRouting(
  routesAnalysised: TPickPass<AsyncReturnType<typeof doAnalysisRequestStatement>>[],
) {
  const aggregatedRouteConfigurations = routesAnalysised.reduce<{
    imports: TPickPass<AsyncReturnType<typeof doAnalysisRequestStatement>>['imports'][];
    routes: TPickPass<AsyncReturnType<typeof doAnalysisRequestStatement>>['routes'][];
  }>(
    (aggregated, current) => {
      return {
        imports: [...aggregated.imports, current.imports],
        routes: [...aggregated.routes, current.routes],
      };
    },
    {
      imports: [],
      routes: [],
    },
  );

  const importConfigurations = dedupeImportConfiguration(
    aggregatedRouteConfigurations.imports.reduce<IImportConfiguration[]>((source, target) => {
      return source.concat(Object.values(target));
    }, []),
  );

  const routeConfigurations = aggregatedRouteConfigurations.routes.reduce<IRouteConfiguration[]>((source, target) => {
    return source.concat(Object.values(target));
  }, []);

  return {
    kind: CE_ROUTE_INFO_KIND.ANALYSIS,
    imports: importConfigurations,
    routes: routeConfigurations,
  } satisfies TPickRouteInfo<typeof CE_ROUTE_INFO_KIND.ANALYSIS>;
}
