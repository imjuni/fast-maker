import { getResolvedImportedModules } from '#/compilers/navigate/getResolvedImportedModules';
import { getRouteNode } from '#/compilers/routes/getRouteNode';
import { getTypeReferences } from '#/compilers/type-tools/getTypeReferences';
import { atOrThrow, orThrow } from 'my-easy-fp';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import * as tsm from 'ts-morph';
import { describe, expect, it } from 'vitest';

const tsconfigPath = path.join(process.cwd(), 'examples', 'tsconfig.example.json');
const project = new tsm.Project({ tsConfigFilePath: tsconfigPath });
const context: { index: number } = { index: 0 };
const abilityInterfaceSourceCode = `
export interface IAbility {
  name: string;
  description: string;

  /** usage count of one day */
  count: number;
}`.trim();

describe('getResolvedModuleInImports', () => {
  it('local type, imported type is named export', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `
import { ITestInfoType01 } from '#/ITestInfo';
import { FastifyRequest } from 'fastify';

export function handler(req: FastifyRequest<{ Querystring: ITestInfoType01 }>) {
  return 'hello';
}`.trim();

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(path.join('examples', name), code, { overwrite });

    create(filename01, abilityInterfaceSourceCode, true);
    const sourceFile02 = create(filename02, source02.trim(), true);

    const node = orThrow(getRouteNode(sourceFile02));
    const parameters = node.node.getParameters();
    const parameter = atOrThrow(parameters, 0);
    const types = getTypeReferences(parameter);

    const r01 = getResolvedImportedModules({
      sourceFile: sourceFile02,
      options: { output: 'a' },
      typeReferenceNodes: types,
    });

    expect(r01).toMatchObject([
      {
        isExternalLibraryImport: false,
        importAt: path.join(process.cwd(), `examples/${filename02}`),
        exportFrom: path.join(process.cwd(), 'examples/interface/ITestInfo.ts'),
        hash: '384OazGJjDIb4YCKglS7vV39QhE2VSf3',
        importDeclarations: [
          {
            isDefaultExport: false,
            importModuleNameTo: 'ITestInfoType01',
            importModuleNameFrom: 'ITestInfoType01',
            isPureType: true,
          },
        ],
      },
    ]);
  });

  it('local type, imported type is default export', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `
import { IPresident } from '#/IPresident';
import { FastifyRequest } from 'fastify';

export function handler(req: FastifyRequest<{ Querystring: IPresident }>) {
  return 'hello';
}`.trim();

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(path.join('examples', name), code, { overwrite });

    create(filename01, abilityInterfaceSourceCode, true);
    const sourceFile02 = create(filename02, source02.trim(), true);

    const node = orThrow(getRouteNode(sourceFile02));
    const parameters = node.node.getParameters();
    const parameter = atOrThrow(parameters, 0);
    const types = getTypeReferences(parameter);

    const r01 = getResolvedImportedModules({
      sourceFile: sourceFile02,
      options: { output: 'a' },
      typeReferenceNodes: types,
    });

    // console.log(JSON.stringify(r01, undefined, 2));
    expect(r01).toMatchObject([
      {
        isExternalLibraryImport: false,
        importAt: path.join(process.cwd(), `examples/${filename02}`),
        exportFrom: path.join(process.cwd(), 'examples/interface/IPresident.ts'),
        hash: 'DtLR5o7wJUofPChC2z9b4BuL4LZEsawN',
        importDeclarations: [
          {
            isDefaultExport: false,
            importModuleNameTo: 'IPresident',
            importModuleNameFrom: 'IPresident',
            isPureType: false,
          },
        ],
      },
    ]);
  });
});
