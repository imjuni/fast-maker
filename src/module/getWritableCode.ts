import IImportConfiguration from '#compiler/interface/IImportConfiguration';
import IConfig from '#config/interface/IConfig';
import dedupeImportConfiguration from '#generator/dedupeImportConfiguration';
import importCodeGenerator from '#generator/importCodeGenerator';
import routeCodeGenerator from '#generator/routeCodeGenerator';
import IRouteConfiguration from '#route/interface/IRouteConfiguration';
import type { IContextRequestHandlerAnalysisMachine as IAnalysisMachineContext } from '#xstate/RequestHandlerAnalysisMachine';

export default function getWritableCode(
  routesAnalysised: Pick<IAnalysisMachineContext, 'importBox' | 'routeBox' | 'messages'>[],
  option: IConfig,
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

  const importCodes = importCodeGenerator({ importConfigurations, option });
  const routeCodes = routeCodeGenerator({ routeConfigurations, option });
  const reasons = aggregatedRouteConfigurations.reasons.flat();

  return {
    importConfigurations,
    routeConfigurations,
    importCodes,
    routeCodes,
    reasons,
  };
}
