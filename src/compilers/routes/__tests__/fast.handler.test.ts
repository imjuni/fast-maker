import { getFastHandler } from '#/compilers/routes/getFastHandler';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import * as tsm from 'ts-morph';
import { describe, it } from 'vitest';

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
const optionsSourceCode = `
import { FastifyRequest, RouteShorthandOptions } from 'fastify';

export const map: Map<string, string> = new Map<string, string>([['time', ':hour(^\\d{2})h:minute(^\\d{2})m']]);

export const methods: number = ['SEARCH'];

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
  it('1', async () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const handlerDir = `handlers/${uuid}_0${(context.index += 1)}`;
    const handlerMethod = 'get.ts';
    const source02 = `${optionsSourceCode}

export function handler(req: FastifyRequest<{ Body: IAbility, Querystring: IAbility }>) {
  return req.body;
}`;

    const pathjoin = (...dir: string[]) => path.join(tsconfigDir, ...dir);
    project.createSourceFile(pathjoin(filename01), abilityInterfaceSourceCode.trim(), {
      overwrite: true,
    });
    const sourceFile02 = project.createSourceFile(pathjoin(handlerDir, handlerMethod), source02.trim(), {
      overwrite: true,
    });

    await getFastHandler(project, pathjoin(handlerDir, handlerMethod), { base: { handler: handlerDir } });
  });
});
