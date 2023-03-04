import getTypeSymbolText from '#compilers/tools/getTypeSymbolText';
import getResolvedPaths from '#configs/getResolvedPaths';
import JestContext from '#tools/__tests__/tools/context';
import * as env from '#tools/__tests__/tools/env';
import 'jest';
import { atOrThrow } from 'my-easy-fp';
import path from 'path';
import { Project, Type } from 'ts-morph';

const context = new JestContext();

beforeAll(async () => {
  context.projectPath = path.join(env.examplePath, 'tsconfig.json');
  context.project = new Project({ tsConfigFilePath: context.projectPath });
  context.routeOption = {
    ...env.routeOption,
    ...getResolvedPaths({ project: context.projectPath, handler: env.handlerPath, output: env.examplePath }),
  };
});

describe('getTypeSymbolText', () => {
  test('pass', async () => {
    const sourceCode = `import { FastifyRequest } from 'fastify';
import { IAbility } from '../../../../../interface/IAbility';

export type TSample = { name: string };
    
export default async function hero(req: FastifyRequest<{ Body: IAbility; Querystring: TSample; }>) {
  return req.body;
}`;

    context.project.createSourceFile('c1.ts', sourceCode, { overwrite: true });

    const sourceFile = context.project.getSourceFileOrThrow('c1.ts');
    const typeAlias = atOrThrow(sourceFile.getTypeAliases(), 0);

    const r = getTypeSymbolText(typeAlias.getType(), (node) => node.getType().getSymbolOrThrow().getEscapedName());
    expect(r).toEqual('__type');
  });

  test('pass - alias symbol', async () => {
    const sourceCode = `import { FastifyRequest } from 'fastify';
import { IAbility } from '../../../../../interface/IAbility';

export type TSample = { name: string };
    
export default async function hero(req: FastifyRequest<{ Body: IAbility; Querystring: TSample; }>) {
  return req.body;
}`;

    context.project.createSourceFile('c1.ts', sourceCode, { overwrite: true });

    const sourceFile = context.project.getSourceFileOrThrow('c1.ts');
    const typeAlias = atOrThrow(sourceFile.getTypeAliases(), 0);

    const spy1 = jest.spyOn(Type.prototype, 'getSymbol').mockImplementationOnce(() => undefined);
    const spy2 = jest.spyOn(Type.prototype, 'getAliasSymbol').mockImplementationOnce(
      () =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        ({
          getEscapedName: () => 'aliasSymbol',
        } as any),
    );

    const r = getTypeSymbolText(typeAlias.getType(), (node) => node.getType().getSymbolOrThrow().getEscapedName());

    spy1.mockRestore();
    spy2.mockRestore();

    expect(r).toEqual('aliasSymbol');
  });

  test('exception', async () => {
    const sourceCode = `import { FastifyRequest } from 'fastify';
import { IAbility } from '../../../../../interface/IAbility';

export type TSample = { name: string };
    
export default async function hero(req: FastifyRequest<{ Body: IAbility; Querystring: TSample; }>) {
  return req.body;
}`;

    context.project.createSourceFile('c1.ts', sourceCode, { overwrite: true });

    const sourceFile = context.project.getSourceFileOrThrow('c1.ts');
    const typeAlias = atOrThrow(sourceFile.getTypeAliases(), 0);

    const spy1 = jest.spyOn(Type.prototype, 'getSymbol').mockImplementationOnce(() => undefined);
    const spy2 = jest.spyOn(Type.prototype, 'getAliasSymbol').mockImplementationOnce(() => undefined);

    try {
      getTypeSymbolText(typeAlias.getType(), (node) => node.getType().getSymbolOrThrow().getEscapedName());
    } catch (caught) {
      spy1.mockRestore();
      spy2.mockRestore();

      expect(caught).toBeTruthy();
    }
  });
});
