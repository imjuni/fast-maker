import { getResolvedImportedModules } from '#/compilers/navigate/getResolvedImportedModules';
import { getRouteNode } from '#/compilers/routes/getRouteNode';
import { getTypeReferences } from '#/compilers/type-tools/getTypeReferences';
import { CE_EXT_KIND } from '#/configs/const-enum/CE_EXT_KIND';
import { posixJoin } from '#/tools/posixJoin';
import { atOrThrow, orThrow } from 'my-easy-fp';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import * as tsm from 'ts-morph';
import { describe, expect, it } from 'vitest';

const tsconfigDir = posixJoin(process.cwd(), 'examples');
const tsconfigPath = posixJoin(tsconfigDir, 'tsconfig.example.json');
const project = new tsm.Project({ tsConfigFilePath: tsconfigPath });
const context: { index: number } = { index: 0 };
const abilityInterfaceSourceCode = `
export interface IAbility {
  name: string;
  description: string;

  /** usage count of one day */
  count: number;
}`.trim();

describe('getResolvedImportedModules', () => {
  it('imported type is named export', () => {
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
      project.createSourceFile(posixJoin('examples', name), code, { overwrite });

    create(filename01, abilityInterfaceSourceCode, true);
    const sourceFile02 = create(filename02, source02.trim(), true);

    const node = orThrow(getRouteNode(sourceFile02));
    const parameters = node.node.getParameters();
    const parameter = atOrThrow(parameters, 0);
    const types = getTypeReferences(parameter);

    const r01 = getResolvedImportedModules({
      sourceFile: sourceFile02,
      options: { output: 'a', extKind: CE_EXT_KIND.NONE },
      typeReferenceNodes: types,
    });

    expect(r01.at(0)).toMatchObject({
      isExternalModuleImport: false,
      isLocalModuleImport: false,
      importAt: posixJoin(tsconfigDir, filename02),
      exportFrom: posixJoin(tsconfigDir, 'interface', 'ITestInfo.ts'),
      hash: 'FX7setsb6HHSRjLKw8M2pQAdXsGxOgKs',
      relativePath: '../examples/interface/ITestInfo',
      importDeclarations: [
        {
          isDefaultExport: false,
          importModuleNameTo: 'ITestInfoType01',
          importModuleNameFrom: 'ITestInfoType01',
          isPureType: true,
        },
      ],
    });

    expect(r01.at(1)).toMatchObject({
      isExternalModuleImport: true,
      isLocalModuleImport: false,
      importAt: posixJoin(tsconfigDir, filename02),
      hash: 'YAmRjm1AR7PPkzafdNY8XtgLFYvkO9zx',
      relativePath: 'fastify',
      importDeclarations: [
        {
          isDefaultExport: false,
          importModuleNameTo: 'FastifyRequest',
          importModuleNameFrom: 'FastifyRequest',
          isPureType: true,
        },
      ],
    });
  });

  it('imported type is default export', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `
import ICompany from '#/ICompany';
import { FastifyRequest } from 'fastify';

export function handler(req: FastifyRequest<{ Querystring: ICompany }>) {
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
      options: { output: 'a', extKind: CE_EXT_KIND.NONE },
      typeReferenceNodes: types,
    });

    expect(r01.at(0)).toMatchObject({
      isExternalModuleImport: false,
      isLocalModuleImport: false,
      hash: 'JDn2w9eLRFEzYgrdR0iWqex79JAS6h5W',
      importAt: posixJoin(tsconfigDir, filename02),
      exportFrom: posixJoin(tsconfigDir, 'interface', 'ICompany.ts'),
      relativePath: '../examples/interface/ICompany',
      importDeclarations: [
        {
          isDefaultExport: true,
          importModuleNameFrom: 'ICompany',
          importModuleNameTo: 'ICompany',
          isPureType: true,
        },
      ],
    });

    expect(r01.at(1)).toMatchObject({
      isExternalModuleImport: true,
      isLocalModuleImport: false,
      importAt: posixJoin(tsconfigDir, filename02),
      hash: 'YAmRjm1AR7PPkzafdNY8XtgLFYvkO9zx',
      relativePath: 'fastify',
      importDeclarations: [
        {
          isDefaultExport: false,
          importModuleNameTo: 'FastifyRequest',
          importModuleNameFrom: 'FastifyRequest',
          isPureType: true,
        },
      ],
    });
  });

  it('imported type is nodejs primitive type, named-bindings primitive type', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `
import ICompany from '#/ICompany';
import type { Server } from 'http';
import { FastifyRequest } from 'fastify';

export function handler(req: FastifyRequest<{ Querystring: ICompany }, Server>) {
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
      options: { output: 'a', extKind: CE_EXT_KIND.NONE },
      typeReferenceNodes: types,
    });

    expect(r01.at(0)).toMatchObject({
      isExternalModuleImport: false,
      isLocalModuleImport: false,
      hash: 'JDn2w9eLRFEzYgrdR0iWqex79JAS6h5W',
      importAt: posixJoin(tsconfigDir, filename02),
      exportFrom: posixJoin(tsconfigDir, 'interface', 'ICompany.ts'),
      relativePath: '../examples/interface/ICompany',
      importDeclarations: [
        {
          isDefaultExport: true,
          importModuleNameFrom: 'ICompany',
          importModuleNameTo: 'ICompany',
          isPureType: true,
        },
      ],
    });

    expect(r01.at(1)).toMatchObject({
      isExternalModuleImport: true,
      isLocalModuleImport: false,
      hash: 'MkNjkKmEcQIWwNEbwXf3yzgEAsdoSE2B',
      importAt: posixJoin(tsconfigDir, filename02),
      exportFrom: 'Server',
      relativePath: 'http',
      importDeclarations: [
        {
          isDefaultExport: false,
          importModuleNameTo: 'Server',
          importModuleNameFrom: 'Server',
          isPureType: false,
        },
      ],
    });

    expect(r01.at(2)).toMatchObject({
      isExternalModuleImport: true,
      isLocalModuleImport: false,
      hash: 'YAmRjm1AR7PPkzafdNY8XtgLFYvkO9zx',
      importAt: posixJoin(tsconfigDir, filename02),
      relativePath: 'fastify',
      importDeclarations: [
        {
          isDefaultExport: false,
          importModuleNameTo: 'FastifyRequest',
          importModuleNameFrom: 'FastifyRequest',
          isPureType: true,
        },
      ],
    });
  });

  it('imported type is nodejs primitive type, named-bindings primitive type with not related exportation', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `
import ICompany from '#/ICompany';
import type { Server } from 'http';
import { FastifyRequest } from 'fastify';
import path from 'node:path';

export function handler(req: FastifyRequest<{ Querystring: ICompany }, Server>) {
  return path.join('a', 'b');
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
      options: { output: 'a', extKind: CE_EXT_KIND.NONE },
      typeReferenceNodes: types,
    });

    expect(r01.at(0)).toMatchObject({
      isExternalModuleImport: false,
      isLocalModuleImport: false,
      hash: 'JDn2w9eLRFEzYgrdR0iWqex79JAS6h5W',
      importAt: posixJoin(tsconfigDir, filename02),
      exportFrom: posixJoin(tsconfigDir, 'interface', 'ICompany.ts'),
      relativePath: '../examples/interface/ICompany',
      importDeclarations: [
        {
          isDefaultExport: true,
          importModuleNameFrom: 'ICompany',
          importModuleNameTo: 'ICompany',
          isPureType: true,
        },
      ],
    });

    expect(r01.at(1)).toMatchObject({
      isExternalModuleImport: true,
      isLocalModuleImport: false,
      hash: 'MkNjkKmEcQIWwNEbwXf3yzgEAsdoSE2B',
      importAt: posixJoin(tsconfigDir, filename02),
      exportFrom: 'Server',
      relativePath: 'http',
      importDeclarations: [
        {
          isDefaultExport: false,
          importModuleNameTo: 'Server',
          importModuleNameFrom: 'Server',
          isPureType: false,
        },
      ],
    });

    expect(r01.at(2)).toMatchObject({
      isExternalModuleImport: true,
      isLocalModuleImport: false,
      hash: 'YAmRjm1AR7PPkzafdNY8XtgLFYvkO9zx',
      importAt: posixJoin(tsconfigDir, filename02),
      relativePath: 'fastify',
      importDeclarations: [
        {
          isDefaultExport: false,
          importModuleNameTo: 'FastifyRequest',
          importModuleNameFrom: 'FastifyRequest',
          isPureType: true,
        },
      ],
    });
  });
});
