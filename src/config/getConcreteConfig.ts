import IConfig from '#config/interface/IConfig';

export default function getConcreteConfig(partialConfig: Partial<IConfig>): IConfig {
  const project = partialConfig.p ?? partialConfig.project;
  const handler = partialConfig.h ?? partialConfig.handler;

  if (project === undefined || project === null) {
    throw new Error('Invalid config: please set project parameter');
  }

  if (handler === undefined || handler === null) {
    throw new Error('Invalid config: please set project parameter');
  }

  const config: IConfig = {
    c: partialConfig.c ?? partialConfig.config ?? undefined,
    config: partialConfig.c ?? partialConfig.config ?? undefined,
    debugLog: partialConfig.debugLog ?? false,
    handler,
    h: handler,
    o: partialConfig.o ?? partialConfig.output ?? handler,
    output: partialConfig.o ?? partialConfig.output ?? handler,
    project,
    p: project,
    v: partialConfig.v ?? partialConfig.verbose ?? false,
    verbose: partialConfig.v ?? partialConfig.verbose ?? false,
    useDefaultExport: partialConfig.useDefaultExport ?? true,
    routeFunctionName: partialConfig.routeFunctionName ?? 'routing',
  };

  return config;
}
