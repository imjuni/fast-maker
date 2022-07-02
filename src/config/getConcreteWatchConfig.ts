import IWatchConfig from '@config/interface/IWatchConfig';

export default function getConcreteWatchConfig(partialConfig: Partial<IWatchConfig>): IWatchConfig {
  const config: IWatchConfig = {
    debounceTime: partialConfig.debounceTime ?? 1000,
  };

  return config;
}
