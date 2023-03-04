import getHandlerWithOption from '#compilers/navigate/getHandlerWithOption';
import getLocalModuleInImports from '#compilers/tools/getLocalModuleInImport';
import getNamedBindingName from '#compilers/tools/getNamedBindingName';
import getTypeReferences from '#compilers/tools/getTypeReferences';
import getResolvedPaths from '#configs/getResolvedPaths';
import JestContext from '#tools/__tests__/tools/context';
import * as env from '#tools/__tests__/tools/env';
import loadSourceData from '#tools/__tests__/tools/loadSourceData';
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

describe('getLocalModuleInImports', () => {
  test('pass - type alias', async () => {
    const sourceCode = `import { FastifyRequest } from 'fastify';
import { IAbility } from '../../../../../interface/IAbility';

export type TSample = { name: string };
    
export default async function hero(req: FastifyRequest<{ Body: IAbility; Querystring: TSample; }>) {
  return req.body;
}`;

    context.project.createSourceFile('c1.ts', sourceCode, { overwrite: true });

    const sourceFile = context.project.getSourceFileOrThrow('c1.ts');
    const { handler } = getHandlerWithOption(sourceFile);

    const r = getLocalModuleInImports({
      sourceFile,
      option: context.routeOption,
      typeReferenceNodes: getTypeReferences(
        atOrThrow(handler?.node.asKindOrThrow(SyntaxKind.FunctionDeclaration).getParameters(), 0),
      ),
    });

    const expectation = await loadSourceData<any>('default', __dirname, 'expects', 'expect.out.01.ts');
    expect(r).toMatchObject(expectation);
  });

  test('pass - interface', async () => {
    const sourceCode = `import { FastifyRequest } from 'fastify';
import { IAbility } from '../../../../../interface/IAbility';

export interface ISample { name: string };
    
export default async function hero(req: FastifyRequest<{ Body: IAbility; Querystring: ISample; }>) {
  return req.body;
}`;

    context.project.createSourceFile('c1.ts', sourceCode, { overwrite: true });

    const sourceFile = context.project.getSourceFileOrThrow('c1.ts');
    const { handler } = getHandlerWithOption(sourceFile);

    const r = getLocalModuleInImports({
      sourceFile,
      option: context.routeOption,
      typeReferenceNodes: getTypeReferences(
        atOrThrow(handler?.node.asKindOrThrow(SyntaxKind.FunctionDeclaration).getParameters(), 0),
      ),
    });

    const expectation = await loadSourceData<any>('default', __dirname, 'expects', 'expect.out.02.ts');
    expect(r).toMatchObject(expectation);
  });

  test('pass - class', async () => {
    const sourceCode = `import { FastifyRequest } from 'fastify';
import { IAbility } from '../../../../../interface/IAbility';

export class SampleC { name: string };
    
export default async function hero(req: FastifyRequest<{ Body: IAbility; Querystring: SampleC; }>) {
  return req.body;
}`;

    context.project.createSourceFile('c1.ts', sourceCode, { overwrite: true });

    const sourceFile = context.project.getSourceFileOrThrow('c1.ts');
    const { handler } = getHandlerWithOption(sourceFile);

    const r = getLocalModuleInImports({
      sourceFile,
      option: context.routeOption,
      typeReferenceNodes: getTypeReferences(
        atOrThrow(handler?.node.asKindOrThrow(SyntaxKind.FunctionDeclaration).getParameters(), 0),
      ),
    });

    const expectation = await loadSourceData<any>('default', __dirname, 'expects', 'expect.out.03.ts');
    expect(r).toMatchObject(expectation);
  });
});

describe('getTypeReferences', () => {
  test('pass - no dedupe', async () => {
    const sourceCode = `import { FastifyRequest } from 'fastify';
import { IAbility } from '../../../../../interface/IAbility';

export class SampleC { name: string };
    
export default async function hero(req: FastifyRequest<{ Body: IAbility; Querystring: SampleC; }>) {
  return req.body;
}`;

    context.project.createSourceFile('c1.ts', sourceCode, { overwrite: true });

    const sourceFile = context.project.getSourceFileOrThrow('c1.ts');
    const { handler } = getHandlerWithOption(sourceFile);

    getTypeReferences(atOrThrow(handler?.node.asKindOrThrow(SyntaxKind.FunctionDeclaration).getParameters(), 0), false);
  });

  test('pass - dedupe', async () => {
    const sourceCode = `import { FastifyRequest } from 'fastify';
import { IAbility } from '../../../../../interface/IAbility';

export class SampleC { name: string };
    
export default async function hero(req: FastifyRequest<{ Body: IAbility; Querystring: SampleC; Params: SampleC; }>) {
  return req.body;
}`;

    context.project.createSourceFile('c1.ts', sourceCode, { overwrite: true });

    const sourceFile = context.project.getSourceFileOrThrow('c1.ts');
    const { handler } = getHandlerWithOption(sourceFile);

    getTypeReferences(atOrThrow(handler?.node.asKindOrThrow(SyntaxKind.FunctionDeclaration).getParameters(), 0));
  });

  test('pass - null', async () => {
    const sourceCode = `import { FastifyRequest } from 'fastify';
import { IAbility } from '../../../../../interface/IAbility';

export class SampleC { name: string };
    
export default async function hero(req: FastifyRequest<{ Body: IAbility; Querystring: SampleC; }>) {
  return req.body;
}`;

    const spy = jest.spyOn(Node.prototype, 'getText').mockImplementationOnce(() => {
      // raise null reference
      return 'AAAAAAAAAAAAAAAAAAAA';
    });

    context.project.createSourceFile('c1.ts', sourceCode, { overwrite: true });

    const sourceFile = context.project.getSourceFileOrThrow('c1.ts');
    const { handler } = getHandlerWithOption(sourceFile);

    getTypeReferences(atOrThrow(handler?.node.asKindOrThrow(SyntaxKind.FunctionDeclaration).getParameters(), 0));

    spy.mockRestore();
  });
});
