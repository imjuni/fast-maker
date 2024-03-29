import { CE_DEFAULT_VALUE } from '#/configs/const-enum/CE_DEFAULT_VALUE';
import type { IBaseOption } from '#/configs/interfaces/IBaseOption';
import type { TRouteBaseOption } from '#/configs/interfaces/TRouteOption';
import type { TWatchBaseOption } from '#/configs/interfaces/TWatchOption';
import path from 'path';

export const examplePath = path.resolve(path.join(__dirname, '..', '..', '..', '..', 'examples'));
export const handlerPath = path.resolve(path.join(examplePath, 'handlers'));

export const option: IBaseOption = {
  handler: handlerPath,
  output: handlerPath,
  project: examplePath,
  skipError: true,
  cliLogo: true,
  routeMap: false,
  include: [],
  exclude: [],
  workerTimeout: CE_DEFAULT_VALUE.DEFAULT_TASK_WAIT_SECOND * 3,
  useDefaultExport: true,
  routeFunctionName: 'routing',
};

export const routeOption: TRouteBaseOption = {
  ...option,
  kind: 'route',
};

export const watchOption: TWatchBaseOption = {
  ...option,
  debounceTime: 1000,
  kind: 'watch',
};
