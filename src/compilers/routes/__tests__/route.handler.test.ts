import { getRouteHandler } from '#/compilers/routes/getRouteHandler';
import { CE_EXT_KIND } from '#/configs/const-enum/CE_EXT_KIND';
import { getHash } from '#/tools/getHash';
import { posixJoin } from '#/tools/posixJoin';
import { atOrThrow } from 'my-easy-fp';
import { startSepAppend } from 'my-node-fp';
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
const importSourceCode = `
import { FastifyRequest, RouteShorthandOptions } from 'fastify';
import { ITestInfoType01 } from '#/ITestInfo';`;

const mapSourceCode = `export const map: Map<string, string> = new Map<string, string>([['time', ':hour(^\\d{2})h:minute(^\\d{2})m']]);`;

const extraMethodSourceCode = `export const methods: number = ['SEARCH'];`;

const optionsSourceCode = `
export const option: RouteShorthandOptions = {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
      },
      required: ['name'],
    },
    body: {
      type: 'object',
      properties: {
        weight: {
          type: 'string',
        },
        age: {
          type: 'number',
        },
      },
      required: ['weight', 'age'],
    },
  },
};`.trim();

describe('getRouteHandler', () => {
  it('handler with type arguments with options', async () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const handlerHash = `${uuid}_0${(context.index += 1)}`;
    const handlerDir = `handlers/${handlerHash}`;
    const handlerMethod = 'get.ts';
    const source02 = `${importSourceCode}
${mapSourceCode}

${extraMethodSourceCode}

${optionsSourceCode}

export function handler(req: FastifyRequest<{ Body: ITestInfoType01, Querystring: ITestInfoType01 }>) {
  return req.body;
}`;

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(posixJoin('examples', name), code, { overwrite });

    create(posixJoin(tsconfigDir, filename01), abilityInterfaceSourceCode, true);
    const sourceFile02 = create(posixJoin(handlerDir, handlerMethod), source02, true);

    const resultHash = getHash(startSepAppend(posixJoin(handlerHash, handlerMethod)));
    const r01 = await getRouteHandler(sourceFile02, {
      output: posixJoin('examples', 'handlers'),
      handler: posixJoin('examples', 'handlers'),
      extKind: CE_EXT_KIND.NONE,
    });

    expect(r01?.imports.at(0)).toMatchObject({
      hash: 'YAmRjm1AR7PPkzafdNY8XtgLFYvkO9zx',
      namedBindings: [
        {
          alias: 'FastifyRequest',
          isPureType: true,
          name: 'FastifyRequest',
        },
      ],
      relativePath: 'fastify',
    });

    expect(r01?.imports.at(1)).toMatchObject({
      hash: 'j6L182tj9Mkyt303boClySeNZr88a8Ok',
      namedBindings: [
        {
          name: 'ITestInfoType01',
          alias: 'ITestInfoType01',
          isPureType: true,
        },
      ],
      importFile: posixJoin(tsconfigDir, 'interface', 'ITestInfo.ts'),
      relativePath: '../interface/ITestInfo',
    });

    expect(r01?.imports.at(2)).toMatchObject({
      hash: resultHash,
      namedBindings: [
        {
          name: 'option',
          alias: `option_${resultHash}`,
          isPureType: false,
        },
        {
          name: 'handler',
          alias: `handler_${resultHash}`,
          isPureType: false,
        },
      ],
      importFile: posixJoin(tsconfigDir, handlerDir, handlerMethod),
      relativePath: `./${handlerHash}/get`,
    });

    expect(r01?.routes.at(0)).toMatchObject({
      methods: ['get'],
      routePath: startSepAppend(atOrThrow(handlerDir.split(path.posix.sep), 1)),
      hash: resultHash,
      hasOption: true,
      handlerName: `handler_${resultHash}`,
      typeArgument: {
        request: 'fastify-request',
        kind: tsm.SyntaxKind.TypeLiteral,
        text: '{ Body: ITestInfoType01, Querystring: ITestInfoType01 }',
      },
      sourceFilePath: posixJoin(tsconfigDir, handlerDir, handlerMethod),
    });
  });

  it('handler with type arguments', async () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const handlerHash = `${uuid}_0${(context.index += 1)}`;
    const handlerDir = `handlers/${handlerHash}`;
    const handlerMethod = 'get.ts';
    const source02 = `${importSourceCode}
${mapSourceCode}

${extraMethodSourceCode}

export function handler(req: FastifyRequest<{ Body: ITestInfoType01, Querystring: ITestInfoType01 }>) {
  return req.body;
}`;

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(posixJoin('examples', name), code, { overwrite });

    create(posixJoin(tsconfigDir, filename01), abilityInterfaceSourceCode, true);
    const sourceFile02 = create(posixJoin(handlerDir, handlerMethod), source02, true);

    const resultHash = getHash(startSepAppend(posixJoin(handlerHash, handlerMethod)));

    const r01 = await getRouteHandler(sourceFile02, {
      output: posixJoin('examples', 'handlers'),
      handler: posixJoin('examples', 'handlers'),
      extKind: CE_EXT_KIND.NONE,
    });

    expect(r01?.imports.at(0)).toMatchObject({
      hash: 'YAmRjm1AR7PPkzafdNY8XtgLFYvkO9zx',
      namedBindings: [
        {
          name: 'FastifyRequest',
          alias: 'FastifyRequest',
          isPureType: true,
        },
      ],
      relativePath: 'fastify',
    });

    expect(r01?.imports.at(1)).toMatchObject({
      hash: 'j6L182tj9Mkyt303boClySeNZr88a8Ok',
      namedBindings: [
        {
          name: 'ITestInfoType01',
          alias: 'ITestInfoType01',
          isPureType: true,
        },
      ],
      importFile: posixJoin(tsconfigDir, 'interface', 'ITestInfo.ts'),
      relativePath: '../interface/ITestInfo',
    });

    expect(r01?.imports.at(2)).toMatchObject({
      hash: resultHash,
      namedBindings: [
        {
          name: 'handler',
          alias: `handler_${resultHash}`,
          isPureType: false,
        },
      ],
      importFile: posixJoin(tsconfigDir, handlerDir, handlerMethod),
      relativePath: `./${handlerHash}/get`,
    });

    expect(r01?.routes.at(0)).toMatchObject({
      methods: ['get'],
      routePath: startSepAppend(handlerHash),
      hash: resultHash,
      hasOption: false,
      handlerName: `handler_${resultHash}`,
      typeArgument: {
        request: 'fastify-request',
        kind: tsm.SyntaxKind.TypeLiteral,
        text: '{ Body: ITestInfoType01, Querystring: ITestInfoType01 }',
      },
      sourceFilePath: posixJoin(tsconfigDir, handlerDir, handlerMethod),
    });
  });

  it('handler with options', async () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const handlerHash = `${uuid}_0${(context.index += 1)}`;
    const handlerDir = `handlers/${handlerHash}`;
    const handlerMethod = 'get.ts';
    const source02 = `${importSourceCode}
${mapSourceCode}

${optionsSourceCode}

${extraMethodSourceCode}

export function handler(req: FastifyRequest) {
  return req.body;
}`;

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(posixJoin('examples', name), code, { overwrite });

    create(posixJoin(tsconfigDir, filename01), abilityInterfaceSourceCode, true);
    const sourceFile02 = create(posixJoin(handlerDir, handlerMethod), source02, true);

    const r01 = await getRouteHandler(sourceFile02, {
      output: posixJoin('examples', 'handlers'),
      handler: posixJoin('examples', 'handlers'),
      extKind: CE_EXT_KIND.NONE,
    });

    const resultHash = getHash(startSepAppend(posixJoin(handlerHash, handlerMethod)));

    expect(r01?.imports.at(0)).toMatchObject({
      hash: 'YAmRjm1AR7PPkzafdNY8XtgLFYvkO9zx',
      namedBindings: [
        {
          name: 'FastifyRequest',
          alias: 'FastifyRequest',
          isPureType: true,
        },
      ],
      relativePath: 'fastify',
    });

    expect(r01?.imports.at(1)).toMatchObject({
      hash: resultHash,
      namedBindings: [
        {
          name: 'option',
          alias: `option_${resultHash}`,
          isPureType: false,
        },
        {
          name: 'handler',
          alias: `handler_${resultHash}`,
          isPureType: false,
        },
      ],
      importFile: posixJoin(tsconfigDir, handlerDir, handlerMethod),
      relativePath: `./${handlerHash}/get`,
    });

    expect(r01?.routes.at(0)).toMatchObject({
      methods: ['get'],
      routePath: `/${handlerHash}`,
      hash: resultHash,
      hasOption: true,
      handlerName: `handler_${resultHash}`,
      typeArgument: {
        request: 'fastify-request',
        kind: undefined,
        text: '',
      },
      sourceFilePath: posixJoin(tsconfigDir, handlerDir, handlerMethod),
    });
  });

  it('no parameter handler with options', async () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const handlerHash = `${uuid}_0${(context.index += 1)}`;
    const handlerDir = `handlers/${handlerHash}`;
    const handlerMethod = 'get.ts';
    const source02 = `${importSourceCode}
${mapSourceCode}

${optionsSourceCode}

${extraMethodSourceCode}

export function handler() {
  return { name: 'ironman', status: 'healthy!' };
}`;

    const create = (name: string, code: string, overwrite: boolean) =>
      project.createSourceFile(posixJoin('examples', name), code, { overwrite });

    create(posixJoin(tsconfigDir, filename01), abilityInterfaceSourceCode, true);
    const sourceFile02 = create(posixJoin(handlerDir, handlerMethod), source02, true);

    const r01 = await getRouteHandler(sourceFile02, {
      output: posixJoin('examples', 'handlers'),
      handler: posixJoin('examples', 'handlers'),
      extKind: CE_EXT_KIND.NONE,
    });

    const resultHash = getHash(startSepAppend(posixJoin(handlerHash, handlerMethod)));

    expect(r01?.imports.at(0)).toMatchObject({
      hash: resultHash,
      namedBindings: [
        {
          name: 'option',
          alias: `option_${resultHash}`,
          isPureType: false,
        },
        {
          name: 'handler',
          alias: `handler_${resultHash}`,
          isPureType: false,
        },
      ],
      importFile: posixJoin(tsconfigDir, handlerDir, handlerMethod),
      relativePath: `./${handlerHash}/get`,
    });

    expect(r01?.routes.at(0)).toMatchObject({
      methods: ['get'],
      routePath: `/${handlerHash}`,
      hash: resultHash,
      hasOption: true,
      handlerName: `handler_${resultHash}`,
      typeArgument: {
        request: 'property-signature',
        kind: undefined,
        text: '',
      },
      sourceFilePath: posixJoin(tsconfigDir, handlerDir, handlerMethod),
    });
  });
});
