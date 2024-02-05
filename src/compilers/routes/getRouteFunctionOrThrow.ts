import type { TFastifyRouteHandler } from '#/compilers/interfaces/TFastifyRouteHandler';
import { getRouteFunction } from '#/compilers/routes/getRouteFunction';
import type * as tsm from 'ts-morph';

export function getRouteFunctionOrThrow(sourceFile: tsm.SourceFile): TFastifyRouteHandler {
  const node = getRouteFunction(sourceFile);

  if (node != null) {
    return node;
  }

  throw new Error(`Cannot found Route handler function in: ${sourceFile.getFilePath().toString()}`);
}
