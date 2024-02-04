import { getFunctionHandlerNode } from '#/compilers/navigate/getFunctionHandlerNode';
import { posixJoin } from '#/tools/posixJoin';
import { randomUUID } from 'crypto';
import * as tsm from 'ts-morph';
import { describe, expect, it } from 'vitest';

const tsconfigDirPath = posixJoin(process.cwd(), 'examples');
const tsconfigFilePath = posixJoin(tsconfigDirPath, 'tsconfig.example.json');
const project = new tsm.Project({ tsConfigFilePath: tsconfigFilePath });
const context: { index: number } = { index: 0 };

describe('getFunctionHandlerNode', () => {
  it('sync function', async () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const sourceCode01 = `import { FastifyReply, FastifyRequest } from 'fastify';
    export function handler (req: FastifyRequest, reply: FastifyReply) {
      console.debug(req.query);
      console.debug(req.body);
      reply.send('hello');
    }`;

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(posixJoin('examples', name), code, { overwrite });
    const sourceFile = create(filename01, sourceCode01, true);

    const declarationMap = sourceFile.getExportedDeclarations();
    const declarations = declarationMap.get('handler') ?? [];
    const r01 = getFunctionHandlerNode(declarations);

    expect(r01).toMatchObject({
      path: posixJoin(tsconfigDirPath, filename01),
      kind: 'sync',
      type: 'function',
      name: 'handler',
    });
  });

  it('async function', async () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const sourceCode01 = `import { FastifyReply, FastifyRequest } from 'fastify';
    export async function handler(req: FastifyRequest, reply: FastifyReply) {
      console.debug(req.query);
      console.debug(req.body);
      reply.send('hello');
    }`;

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(posixJoin('examples', name), code, { overwrite });
    const sourceFile = create(filename01, sourceCode01, true);

    const declarationMap = sourceFile.getExportedDeclarations();
    const declarations = declarationMap.get('handler') ?? [];
    const r01 = getFunctionHandlerNode(declarations);

    expect(r01).toMatchObject({
      path: posixJoin(tsconfigDirPath, filename01),
      kind: 'async',
      type: 'function',
      name: 'handler',
    });
  });
});
