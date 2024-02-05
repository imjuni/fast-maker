import { getRouteOptionVariable } from '#/compilers/routes/getRouteOptionVariable';
import { getRouteOptions } from '#/compilers/routes/getRouteOptions';
import { posixJoin } from '#/tools/posixJoin';
import { randomUUID } from 'node:crypto';
import * as tsm from 'ts-morph';
import { describe, expect, it } from 'vitest';

const tsconfigDir = posixJoin(process.cwd(), 'examples');
const tsconfigPath = posixJoin(tsconfigDir, 'tsconfig.example.json');
const project = new tsm.Project({ tsConfigFilePath: tsconfigPath });
const context: { index: number } = { index: 0 };
const create = (name: string, code: string, overwrite: boolean) =>
  project.createSourceFile(posixJoin('examples', name), code, { overwrite });
const fastifyImport = `import { FastifyInstance } from 'fastify';`;
const mapExport = `export const map: Map<string, string> = new Map<string, string>([['time', ':hour(^\\d{2})h:minute(^\\d{2})m']]);`;
const methodsExport = `export const methods: number = ['SEARCH'];`;
const optionBody = `
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
    },`.trim();

describe('getRouteOptions', () => {
  it('successfully loaded', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const source01 = `
export const map: Map<string, string> = new Map<string, string>([['time', ':hour(^\\d{2})h:minute(^\\d{2})m']]);

export const methods: number = ['SEARCH'];

export const option: RouteShorthandOptions = {
  ${optionBody}
};

export async function handler(req: FastifyRequest<{ Body: IAbility }>) {
  return req.body;
}`;

    const sourceFile = create(filename01, source01.trim(), true);

    const r01 = getRouteOptions(sourceFile);

    expect(r01).toMatchObject({ has: { option: true, methods: true, map: true } });
  });
});

describe('getRouteOptionVariable', () => {
  it('variable declaration', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const source01 = `
export const map: Map<string, string> = new Map<string, string>([['time', ':hour(^\\d{2})h:minute(^\\d{2})m']]);

export const methods: number = ['SEARCH'];

export const option: RouteShorthandOptions = {
  ${optionBody}
};

export async function handler(req: FastifyRequest<{ Body: IAbility }>) {
  return req.body;
}`;

    const sourceFile = create(filename01, source01.trim(), true);
    const r01 = getRouteOptionVariable(sourceFile);

    expect(r01).toMatchObject({
      kind: 'sync',
      type: 'variable',
      path: posixJoin(tsconfigDir, filename01),
      name: 'option',
    });
  });

  it('sync function declaration', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const source01 = `${fastifyImport}
${mapExport}
${methodsExport}

export function option(fastify: FastifyInstance): RouteShorthandOptions {
  return {
    ${optionBody}
  };
};

export async function handler(req: FastifyRequest<{ Body: IAbility }>) {
  return req.body;
}`;

    const sourceFile = create(filename01, source01.trim(), true);
    const r01 = getRouteOptionVariable(sourceFile);

    expect(r01).toMatchObject({
      kind: 'sync',
      type: 'function',
      path: posixJoin(tsconfigDir, filename01),
      name: 'option',
    });
  });

  it('async function declaration', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const source01 = `${fastifyImport}
${mapExport}
${methodsExport}

export async function option(fastify: FastifyInstance): RouteShorthandOptions {
  return {
    ${optionBody}
  };
};

export async function handler(req: FastifyRequest<{ Body: IAbility }>) {
  return req.body;
}`;

    const sourceFile = create(filename01, source01.trim(), true);
    const r01 = getRouteOptionVariable(sourceFile);

    expect(r01).toMatchObject({
      kind: 'async',
      type: 'function',
      path: posixJoin(tsconfigDir, filename01),
      name: 'option',
    });
  });

  it('sync arrow function declaration', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const source01 = `${fastifyImport}
${mapExport}
${methodsExport}

export const option = (fastify: FastifyInstance): RouteShorthandOptions => {
  return {
    ${optionBody}
  };
};

export async function handler(req: FastifyRequest<{ Body: IAbility }>) {
  return req.body;
}`;

    const sourceFile = create(filename01, source01.trim(), true);
    const r01 = getRouteOptionVariable(sourceFile);

    expect(r01).toMatchObject({
      kind: 'sync',
      type: 'arrow',
      path: posixJoin(tsconfigDir, filename01),
      name: 'option',
    });
  });

  it('async arrow function declaration', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const source01 = `${fastifyImport}
${mapExport}
${methodsExport}

export const option = async (fastify: FastifyInstance): RouteShorthandOptions => {
  return {
    ${optionBody}
  };
};

export async function handler(req: FastifyRequest<{ Body: IAbility }>) {
  return req.body;
}`;

    const sourceFile = create(filename01, source01.trim(), true);
    const r01 = getRouteOptionVariable(sourceFile);

    expect(r01).toMatchObject({
      kind: 'async',
      type: 'arrow',
      path: posixJoin(tsconfigDir, filename01),
      name: 'option',
    });
  });
});
