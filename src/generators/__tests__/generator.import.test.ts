import getHandlerWithOption from '#compilers/navigate/getHandlerWithOption';
import getLocalModuleInImports from '#compilers/tools/getLocalModuleInImport';
import getTypeReferences from '#compilers/tools/getTypeReferences';
import getResolvedPaths from '#configs/getResolvedPaths';
import dedupeImportConfiguration from '#generators/dedupeImportConfiguration';
import getImportConfigurationFromResolutions from '#generators/getImportConfigurationFromResolutions';
import JestContext from '#tools/__tests__/tools/context';
import * as env from '#tools/__tests__/tools/env';
import loadSourceData from '#tools/__tests__/tools/loadSourceData';
import posixJoin from '#tools/posixJoin';
import { getExpectValue } from '@maeum/test-utility';
import 'jest';
import { atOrThrow } from 'my-easy-fp';
import path from 'path';
import { Node, Project, SyntaxKind } from 'ts-morph';

const context = new JestContext();

beforeAll(async () => {
  context.projectPath = path.join(env.examplePath, 'tsconfig.json');
  context.project = new Project({ tsConfigFilePath: context.projectPath });
  context.routeOption = {
    ...env.routeOption,
    ...getResolvedPaths({ project: context.projectPath, handler: env.handlerPath, output: env.examplePath }),
  };
});

describe('dedupeImportConfiguration', () => {
  test('pass', async () => {
    const sourceCode = `import { FastifyRequest } from 'fastify';
import { IAbility } from '../../../../../interface/IAbility';

export type TSample = { name: string };
    
export default async function hero(req: FastifyRequest<{ Body: IAbility; Querystring: TSample; }>) {
  return req.body;
}`;

    const routerPath = posixJoin(env.handlerPath, 'get', 'c1.ts');
    context.project.createSourceFile(routerPath, sourceCode, { overwrite: true });

    const sourceFile = context.project.getSourceFileOrThrow(routerPath);
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

    const r2 = dedupeImportConfiguration(r1);

    const r3 = getExpectValue(r2, (_, value: any) => {
      if (value === '[Circular]') return undefined;
      if (value instanceof Node) return undefined;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value;
    });

    const expectation = await loadSourceData<any>('default', __dirname, 'expects', 'expect.out.01.ts');
    expect(r3).toMatchObject(expectation);
  });

  test('pass - with merge', async () => {
    const sourceCode = `import { FastifyRequest } from 'fastify';
import { IAbility } from '../../../../../interface/IAbility';

export type TSample = { name: string };
    
export default async function hero(req: FastifyRequest<{ Body: IAbility; Querystring: TSample; }>) {
  return req.body;
}`;

    const routerPath = posixJoin(env.handlerPath, 'get', 'c2.ts');
    context.project.createSourceFile(routerPath, sourceCode, { overwrite: true });

    const sourceFile = context.project.getSourceFileOrThrow(routerPath);
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

    const r2 = dedupeImportConfiguration([...r1, ...r1, ...r1]);

    const r3 = getExpectValue(r2, (_, value: any) => {
      if (value === '[Circular]') return undefined;
      if (value instanceof Node) return undefined;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return value;
    });

    const expectation = await loadSourceData<any>('default', __dirname, 'expects', 'expect.out.02.ts');
    expect(r3).toMatchObject(expectation);
  });
});
