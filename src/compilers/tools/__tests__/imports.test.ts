import getHandlerWithOption from '#/compilers/navigate/getHandlerWithOption';
import getLocalModuleInImports from '#/compilers/tools/getLocalModuleInImport';
import getNamedBindingName from '#/compilers/tools/getNamedBindingName';
import getTypeReferences from '#/compilers/type-tools/getTypeReferences';
import getResolvedPaths from '#/configs/getResolvedPaths';
import getImportConfigurationFromResolutions from '#/generators/getImportConfigurationFromResolutions';
import mergeImportConfiguration from '#/generators/mergeImportConfiguration';
import JestContext from '#/tools/__tests__/tools/context';
import * as env from '#/tools/__tests__/tools/env';
import loadSourceData from '#/tools/__tests__/tools/loadSourceData';
import fastCopy from 'fast-copy';
import 'jest';
import { atOrThrow } from 'my-easy-fp';
import path from 'path';
import { Project, SyntaxKind } from 'ts-morph';

const context = new JestContext();

beforeAll(async () => {
  context.projectPath = path.join(env.examplePath, 'tsconfig.json');
  context.project = new Project({ tsConfigFilePath: context.projectPath });
  context.routeOption = {
    ...env.routeOption,
    ...getResolvedPaths({ project: context.projectPath, handler: env.handlerPath, output: env.examplePath }),
  };
});

describe('getNamedBindingName', () => {
  test('pass', async () => {
    const sourceCode = `import { FastifyRequest } from 'fastify';
import { IAbility } from '../../../../../interface/IAbility';

export type TSample = { name: string };
    
export default async function hero(req: FastifyRequest<{ Body: IAbility; Querystring: TSample; }>) {
  return req.body;
}`;

    context.project.createSourceFile('c1.ts', sourceCode, { overwrite: true });

    const sourceFile = context.project.getSourceFileOrThrow('c1.ts');
    const ic = atOrThrow(sourceFile.getImportDeclarations(), 0).getImportClauseOrThrow();
    const b = atOrThrow(ic.getNamedBindings(), 0);

    const spy = jest.spyOn(b, 'getKind').mockImplementationOnce(() => SyntaxKind.NamespaceImport);
    const r = getNamedBindingName(b);

    spy.mockRestore();

    expect(r).toMatchObject([]);
  });
});

describe('mergeImportConfiguration', () => {
  test('pass', async () => {
    const sourceCode = `import { FastifyRequest } from 'fastify';
import { IAbility } from '../../../../../interface/IAbility';

export type TSample = { name: string };
    
export default async function hero(req: FastifyRequest<{ Body: IAbility; Querystring: TSample; }>) {
  return req.body;
}`;

    context.project.createSourceFile('c1.ts', sourceCode, { overwrite: true });

    const sourceFile = context.project.getSourceFileOrThrow('c1.ts');
    const { handler } = getHandlerWithOption(sourceFile);

    const resolutions = getLocalModuleInImports({
      sourceFile,
      option: context.routeOption,
      typeReferenceNodes: getTypeReferences(
        atOrThrow(handler?.node.asKindOrThrow(SyntaxKind.FunctionDeclaration).getParameters(), 0),
      ),
    });

    const r = getImportConfigurationFromResolutions({
      resolutions,
    });

    const m = mergeImportConfiguration(atOrThrow(r, 0), atOrThrow(r, 0));

    const expectation = await loadSourceData<any>('default', __dirname, 'expects', 'expect.out.04.ts');
    expect(m).toMatchObject(expectation);
  });

  test('pass - with warn', async () => {
    const sourceCode = `import { FastifyRequest } from 'fastify';
import { IAbility } from '../../../../../interface/IAbility';

export type TSample = { name: string };
    
export default async function hero(req: FastifyRequest<{ Body: IAbility; Querystring: TSample; }>) {
  return req.body;
}`;

    context.project.createSourceFile('c1.ts', sourceCode, { overwrite: true });

    const sourceFile = context.project.getSourceFileOrThrow('c1.ts');
    const { handler } = getHandlerWithOption(sourceFile);

    const resolutions = getLocalModuleInImports({
      sourceFile,
      option: context.routeOption,
      typeReferenceNodes: getTypeReferences(
        atOrThrow(handler?.node.asKindOrThrow(SyntaxKind.FunctionDeclaration).getParameters(), 0),
      ),
    });

    const r1 = getImportConfigurationFromResolutions({
      resolutions,
    });

    const r2 = fastCopy(atOrThrow(r1, 0));
    r2.importFile = '';

    const m = mergeImportConfiguration(atOrThrow(r1, 0), r2);

    const expectation = await loadSourceData<any>('default', __dirname, 'expects', 'expect.out.04.ts');
    expectation.importFile = '';

    expect(m).toMatchObject(expectation);
  });
});
