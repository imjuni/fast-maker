import { getRouteHandler } from '#/compilers/routes/getRouteHandler';
import { getNamedBindingName } from '#/compilers/tools/getNamedBindingName';
import { CE_EXT_KIND } from '#/configs/const-enum/CE_EXT_KIND';
import { mergeImportConfiguration } from '#/generators/mergeImportConfiguration';
import { posixJoin } from '#/tools/posixJoin';
import { randomUUID } from 'crypto';
import { atOrThrow } from 'my-easy-fp';
import * as tsm from 'ts-morph';
import { describe, expect, it, vitest } from 'vitest';

const tsconfigDir = posixJoin(process.cwd(), 'examples');
const tsconfigPath = posixJoin(tsconfigDir, 'tsconfig.example.json');
const project = new tsm.Project({ tsConfigFilePath: tsconfigPath });
const context: { index: number } = { index: 0 };

describe('getNamedBindingName', () => {
  it('pass', async () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const sourceCode01 = `import { FastifyRequest } from 'fastify';
import { IAbility } from '../../../../../interface/IAbility';

export type TSample = { name: string };
    
export async function handler(req: FastifyRequest<{ Body: IAbility; Querystring: TSample; }>) {
  return req.body;
}`;

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(posixJoin('examples', name), code, { overwrite });

    const sourceFile01 = create(filename01, sourceCode01.trim(), true);

    const importClause = atOrThrow(sourceFile01.getImportDeclarations(), 0).getImportClauseOrThrow();
    const b = atOrThrow(importClause.getNamedBindings(), 0);

    const spy = vitest.spyOn(b, 'getKind').mockImplementationOnce(() => tsm.SyntaxKind.NamespaceImport);
    const r = getNamedBindingName(b);

    spy.mockRestore();

    expect(r).toMatchObject([]);
  });
});

describe('mergeImportConfiguration', () => {
  it('pass', async () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const sourceCode01 = `import { FastifyRequest } from 'fastify';
import { IAbility } from '../../../../../interface/IAbility';

export type TSample = { name: string };
    
export async function handler(req: FastifyRequest<{ Body: IAbility; Querystring: TSample; }>) {
  return req.body;
}`;

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(posixJoin('examples', name), code, { overwrite });

    const sourceFile01 = create(filename01, sourceCode01.trim(), true);

    const handler = await getRouteHandler(sourceFile01, {
      output: tsconfigDir,
      handler: tsconfigDir,
      extKind: CE_EXT_KIND.NONE,
    });

    const r01 = mergeImportConfiguration(atOrThrow(handler?.imports, 0), atOrThrow(handler?.imports, 0));
    expect(r01).toMatchObject({
      hash: 'YAmRjm1AR7PPkzafdNY8XtgLFYvkO9zx',
      namedBindings: [
        {
          name: 'FastifyRequest',
          alias: 'FastifyRequest',
          isPureType: true,
        },
      ],
      nonNamedBinding: undefined,
      nonNamedBindingIsPureType: undefined,
      relativePath: 'fastify',
    });
  });
});
