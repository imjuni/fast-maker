import type IBaseOption from '#configs/interfaces/IBaseOption';
import type { TRouteBaseOption } from '#configs/interfaces/TRouteOption';
import type { TWatchBaseOption } from '#configs/interfaces/TWatchOption';
import path from 'path';

export const examplePath = path.resolve(path.join(__dirname, '..', '..', '..', '..', 'examples'));
export const handlerPath = path.resolve(path.join(examplePath, 'handlers'));

export const option: IBaseOption = {
  debugLog: false,
  handler: handlerPath,
  output: handlerPath,
  project: examplePath,
  verbose: false,
  useDefaultExport: true,
  routeFunctionName: 'routing',
};

export const routeOption: TRouteBaseOption = {
  ...option,
};

export const watchOption: TWatchBaseOption = {
  ...option,
  debounceTime: 1000,
};
