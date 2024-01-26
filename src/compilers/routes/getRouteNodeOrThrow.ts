import type { TFastifyRouteHandler } from '#/compilers/interfaces/TFastifyRouteHandler';
import { getRouteNode } from '#/compilers/routes/getRouteNode';
import type * as tsm from 'ts-morph';

export function getRouteNodeOrThrow(sourceFile: tsm.SourceFile): TFastifyRouteHandler {
  const node = getRouteNode(sourceFile);

  if (node != null) {
    return node;
  }

  throw new Error(`Cannot found Route handler function in: ${sourceFile.getFilePath().toString()}`);
}
