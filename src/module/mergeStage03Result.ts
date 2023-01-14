import type proceedStage03 from '#module/proceedStage03';

export default function mergeStage03Result(
  routes: Array<Omit<ReturnType<typeof proceedStage03>, 'reasons'>>,
): Omit<ReturnType<typeof proceedStage03>, 'reasons'> {
  return {
    importConfigurations: routes.map((route) => route.importConfigurations).flat(),
    routeConfigurations: routes.map((route) => route.routeConfigurations).flat(),
  };
}
