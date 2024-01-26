import { getRouteOptions } from '#/compilers/routes/getRouteOptions';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import * as tsm from 'ts-morph';
import { describe, expect, it } from 'vitest';

const tsconfigPath = path.join(process.cwd(), 'examples', 'tsconfig.example.json');
const context: { index: number } = { index: 0 };

describe('getRouteOptions', () => {
  it('successfully loaded', () => {
    const project = new tsm.Project({ tsConfigFilePath: tsconfigPath });
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const source01 = `
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
};

export async function handler(req: FastifyRequest<{ Body: IAbility }>) {
  return req.body;
}`;

    const sourceFile = project.createSourceFile(filename01, source01.trim(), { overwrite: true });
    const r01 = getRouteOptions(sourceFile);
    expect(r01).toMatchObject({ has: { option: true, methods: true, map: true } });
  });
});
