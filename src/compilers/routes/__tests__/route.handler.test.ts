import { getRouteHandler } from '#/compilers/routes/getRouteHandler';
import { CE_REQUEST_KIND } from '#/compilers/type-tools/const-enum/CE_REQUEST_KIND';
import { CE_EXT_KIND } from '#/configs/const-enum/CE_EXT_KIND';
import { getHash } from '#/tools/getHash';
import { atOrThrow } from 'my-easy-fp';
import { startSepAppend } from 'my-node-fp';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import * as tsm from 'ts-morph';
import { describe, expect, it } from 'vitest';

const tsconfigDir = path.join(process.cwd(), 'examples');
const tsconfigPath = path.join(tsconfigDir, 'tsconfig.example.json');
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

    const pathjoin = (...dir: string[]) => path.join(tsconfigDir, ...dir);
    project.createSourceFile(pathjoin(filename01), abilityInterfaceSourceCode.trim(), {
      overwrite: true,
    });
    const sourceFile02 = project.createSourceFile(pathjoin(handlerDir, handlerMethod), source02.trim(), {
      overwrite: true,
    });

    const resultHash = getHash(startSepAppend(path.join(handlerHash, handlerMethod)));
    const r01 = await getRouteHandler(sourceFile02, {
      output: path.join('examples', 'handlers'),
      handler: path.join('examples', 'handlers'),
      extKind: CE_EXT_KIND.NONE,
    });

    expect(r01).toMatchObject({
      imports: [
        {
          hash: 'j6L182tj9Mkyt303boClySeNZr88a8Ok',
          namedBindings: [
            {
              name: 'ITestInfoType01',
              alias: 'ITestInfoType01',
              isPureType: true,
            },
          ],
          importFile: path.join(tsconfigDir, 'interface', 'ITestInfo.ts'),
          relativePath: '../interface/ITestInfo',
        },
        {
          hash: resultHash,
          namedBindings: [
            {
              name: 'option',
              alias: `option_${resultHash}`,
              isPureType: false,
            },
          ],
          importFile: path.join(tsconfigDir, handlerDir, handlerMethod),
          relativePath: `./${handlerHash}/get`,
        },
      ],
      routes: [
        {
          methods: ['get'],
          routePath: startSepAppend(atOrThrow(handlerDir.split(path.posix.sep), 1)),
          hash: resultHash,
          hasOption: true,
          handlerName: `handler_${resultHash}`,
          typeArgument: {
            request: 'fastify-request',
            kind: 'type-literal',
            text: '{ Body: ITestInfoType01, Querystring: ITestInfoType01 }',
          },
          sourceFilePath: path.join(tsconfigDir, handlerDir, handlerMethod),
        },
      ],
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

    const pathjoin = (...dir: string[]) => path.join(tsconfigDir, ...dir);
    project.createSourceFile(pathjoin(filename01), abilityInterfaceSourceCode.trim(), {
      overwrite: true,
    });
    const sourceFile02 = project.createSourceFile(pathjoin(handlerDir, handlerMethod), source02.trim(), {
      overwrite: true,
    });

    const r01 = await getRouteHandler(sourceFile02, {
      output: path.join('examples', 'handlers'),
      handler: path.join('examples', 'handlers'),
      extKind: CE_EXT_KIND.NONE,
    });

    const resultHash = getHash(startSepAppend(path.join(handlerHash, handlerMethod)));
    expect(r01).toMatchObject({
      imports: [
        {
          hash: 'j6L182tj9Mkyt303boClySeNZr88a8Ok',
          namedBindings: [
            {
              name: 'ITestInfoType01',
              alias: 'ITestInfoType01',
              isPureType: true,
            },
          ],
          importFile: path.join(process.cwd(), '/examples', 'interface', 'ITestInfo.ts'),
          relativePath: '../interface/ITestInfo',
        },
      ],
      routes: [
        {
          methods: ['get'],
          routePath: startSepAppend(handlerHash),
          hash: resultHash,
          hasOption: false,
          handlerName: `handler_${resultHash}`,
          typeArgument: {
            request: 'fastify-request',
            kind: 'type-literal',
            text: '{ Body: ITestInfoType01, Querystring: ITestInfoType01 }',
          },
          sourceFilePath: path.join(process.cwd(), 'examples', handlerDir, handlerMethod),
        },
      ],
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

    const pathjoin = (...dir: string[]) => path.join(tsconfigDir, ...dir);
    project.createSourceFile(pathjoin(filename01), abilityInterfaceSourceCode.trim(), {
      overwrite: true,
    });
    const sourceFile02 = project.createSourceFile(pathjoin(handlerDir, handlerMethod), source02.trim(), {
      overwrite: true,
    });

    const r01 = await getRouteHandler(sourceFile02, {
      output: path.join('examples', 'handlers'),
      handler: path.join('examples', 'handlers'),
      extKind: CE_EXT_KIND.NONE,
    });

    const resultHash = getHash(startSepAppend(path.join(handlerHash, handlerMethod)));
    expect(r01).toMatchObject({
      imports: [
        {
          hash: resultHash,
          namedBindings: [
            {
              name: 'option',
              alias: `option_${resultHash}`,
              isPureType: false,
            },
          ],
          importFile: path.join(process.cwd(), 'examples', handlerDir, handlerMethod),
          relativePath: `./${handlerHash}/get`,
        },
      ],
      routes: [
        {
          methods: ['get'],
          routePath: startSepAppend(handlerHash),
          hash: resultHash,
          hasOption: true,
          handlerName: `handler_${resultHash}`,
          typeArgument: {
            request: CE_REQUEST_KIND.FASTIFY_REQUEST,
            kind: undefined,
            text: '',
          },
          sourceFilePath: path.join(process.cwd(), 'examples', handlerDir, handlerMethod),
        },
      ],
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

    const pathjoin = (...dir: string[]) => path.join(tsconfigDir, ...dir);
    project.createSourceFile(pathjoin(filename01), abilityInterfaceSourceCode.trim(), {
      overwrite: true,
    });
    const sourceFile02 = project.createSourceFile(pathjoin(handlerDir, handlerMethod), source02.trim(), {
      overwrite: true,
    });

    const r01 = await getRouteHandler(sourceFile02, {
      output: path.join('examples', 'handlers'),
      handler: path.join('examples', 'handlers'),
      extKind: CE_EXT_KIND.NONE,
    });

    const resultHash = getHash(startSepAppend(path.join(handlerHash, handlerMethod)));

    expect(r01).toMatchObject({
      imports: [
        {
          hash: resultHash,
          namedBindings: [
            {
              name: 'option',
              alias: `option_${resultHash}`,
              isPureType: false,
            },
          ],
          importFile: path.join(process.cwd(), 'examples', handlerDir, handlerMethod),
          relativePath: `./${handlerHash}/get`,
        },
      ],
      routes: [
        {
          methods: ['get'],
          routePath: startSepAppend(handlerHash),
          hash: resultHash,
          hasOption: true,
          handlerName: `handler_${resultHash}`,
          typeArgument: {
            request: CE_REQUEST_KIND.PROPERTY_SIGNATURE,
            kind: undefined,
            text: '',
          },
          sourceFilePath: path.join(process.cwd(), 'examples', handlerDir, handlerMethod),
        },
      ],
    });
  });
});
