import type doDedupeRouting from '#modules/doDedupeRouting';
import { CE_ROUTE_INFO_KIND } from '#routes/interface/CE_ROUTE_INFO_KIND';

export default function mergeAnalysisRequestStatements(
  routes: Omit<ReturnType<typeof doDedupeRouting>, 'kind'>[],
): ReturnType<typeof doDedupeRouting> {
  return {
    kind: CE_ROUTE_INFO_KIND.ANALYSIS,
    imports: routes.map((route) => route.imports).flat(),
    routes: routes.map((route) => route.routes).flat(),
  };
}
