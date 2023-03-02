import type doDedupeRouting from '#modules/doDedupeRouting';

export default function mergeStage03Result(
  routes: ReturnType<typeof doDedupeRouting>[],
): ReturnType<typeof doDedupeRouting> {
  return {
    importConfigurations: routes.map((route) => route.importConfigurations).flat(),
    routeConfigurations: routes.map((route) => route.routeConfigurations).flat(),
  };
}
