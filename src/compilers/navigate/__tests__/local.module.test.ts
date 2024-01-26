import { getResolvedInFileImportedModules } from '#/compilers/navigate/getResolvedInFileImportedModules';
import { getRouteNode } from '#/compilers/routes/getRouteNode';
import { getTypeReferences } from '#/compilers/type-tools/getTypeReferences';
import { atOrThrow, orThrow } from 'my-easy-fp';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import * as tsm from 'ts-morph';
import { describe, it } from 'vitest';

const tsconfigDirPath = path.join(process.cwd(), 'examples');
const tsconfigFilePath = path.join(tsconfigDirPath, 'tsconfig.example.json');
const project = new tsm.Project({ tsConfigFilePath: tsconfigFilePath });
const context: { index: number } = { index: 0 };

describe('getLocalModuleInImports', () => {
  it('exported module in route handler file', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const source01 = `
import { FastifyRequest } from 'fastify';

export type TQuerystring = {
  name: string;
  age: number;
}

export interface IParams {
  id: string
}

export class Body {
  weight: number
}

export function handler(req: FastifyRequest<{ Querystring: TQuerystring, Params: IParams, Body: Body }>) {
  return 'hello';
}`.trim();

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(path.join('examples', name), code, { overwrite });

    const sourceFile = create(filename01, source01, true);
    const node = orThrow(getRouteNode(sourceFile));
    const parameters = node.node.getParameters();
    const parameter = atOrThrow(parameters, 0);
    const types = getTypeReferences(parameter);

    const imports = getResolvedInFileImportedModules({
      sourceFile,
      options: { output: tsconfigDirPath },
      typeReferenceNodes: types,
    });

    console.log(JSON.stringify(imports, undefined, 2));
  });
});
