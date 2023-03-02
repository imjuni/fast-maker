import type IImportConfiguration from '#compilers/interfaces/IImportConfiguration';
import dedupeImportConfiguration from '#generators/dedupeImportConfiguration';
import reasons from '#modules/reasons';
import type IRouteConfiguration from '#routes/interface/IRouteConfiguration';
import type { IAnalysisMachineContext } from '#xstate/RequestHandlerAnalysisMachine';

export default function doDedupeRouting(
  routesAnalysised: Pick<IAnalysisMachineContext, 'importMap' | 'routeMap' | 'messages'>[],
) {
  const aggregatedRouteConfigurations = routesAnalysised.reduce<{
    importMap: IAnalysisMachineContext['importMap'][];
    routeMap: IAnalysisMachineContext['routeMap'][];
    reasons: IAnalysisMachineContext['messages'][];
  }>(
    (aggregated, current) => {
      return {
        importMap: [...aggregated.importMap, current.importMap],
        routeMap: [...aggregated.routeMap, current.routeMap],
        reasons: [...aggregated.reasons, current.messages],
      };
    },
    {
      importMap: [],
      routeMap: [],
      reasons: [],
    },
  );

  const importConfigurations = dedupeImportConfiguration(
    aggregatedRouteConfigurations.importMap.reduce<IImportConfiguration[]>((source, target) => {
      return source.concat(Object.values(target));
    }, []),
  );

  const routeConfigurations = aggregatedRouteConfigurations.routeMap.reduce<IRouteConfiguration[]>((source, target) => {
    return source.concat(Object.values(target));
  }, []);

  reasons.add(...aggregatedRouteConfigurations.reasons.flat());

  return {
    importConfigurations,
    routeConfigurations,
  };
}
