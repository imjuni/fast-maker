import type IImportConfiguration from '#compiler/interface/IImportConfiguration';
import dedupeImportConfiguration from '#generator/dedupeImportConfiguration';
import type IRouteConfiguration from '#route/interface/IRouteConfiguration';
import type { IAnalysisMachineContext } from '#xstate/RequestHandlerAnalysisMachine';

export default function proceedStage03(
  routesAnalysised: Pick<IAnalysisMachineContext, 'importBox' | 'routeBox' | 'messages'>[],
) {
  const aggregatedRouteConfigurations = routesAnalysised.reduce<{
    importBox: IAnalysisMachineContext['importBox'][];
    routeBox: IAnalysisMachineContext['routeBox'][];
    reasons: IAnalysisMachineContext['messages'][];
  }>(
    (aggregated, current) => {
      return {
        importBox: [...aggregated.importBox, current.importBox],
        routeBox: [...aggregated.routeBox, current.routeBox],
        reasons: [...aggregated.reasons, current.messages],
      };
    },
    {
      importBox: [],
      routeBox: [],
      reasons: [],
    },
  );

  const importConfigurations = dedupeImportConfiguration(
    aggregatedRouteConfigurations.importBox.reduce<IImportConfiguration[]>((source, target) => {
      return source.concat(Object.values(target));
    }, []),
  );

  const routeConfigurations = aggregatedRouteConfigurations.routeBox.reduce<IRouteConfiguration[]>((source, target) => {
    return source.concat(Object.values(target));
  }, []);

  const reasons = aggregatedRouteConfigurations.reasons.flat();

  return {
    importConfigurations,
    routeConfigurations,
    reasons,
  };
}
