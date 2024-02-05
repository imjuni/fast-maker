import type { TFastifyRouteOption } from '#/compilers/interfaces/TFastifyRouteOption';
import type { IRouteConfiguration } from '#/routes/interfaces/IRouteConfiguration';

export function getRouteOptionKind(option: TFastifyRouteOption): IRouteConfiguration['optionKind'] | undefined {
  if (option.kind === 'async' && option.type === 'arrow') {
    return 'async-arrow';
  }

  if (option.kind === 'sync' && option.type === 'arrow') {
    return 'sync-arrow';
  }

  if (option.kind === 'async' && option.type === 'function') {
    return 'async-function';
  }

  if (option.kind === 'sync' && option.type === 'function') {
    return 'sync-function';
  }

  if (option.kind === 'sync' && option.type === 'variable') {
    return 'variable';
  }

  return undefined;
}
