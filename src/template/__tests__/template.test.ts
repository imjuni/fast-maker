import { CE_REQUEST_KIND } from '#/compilers/type-tools/const-enum/CE_REQUEST_KIND';
import { TemplateContainer } from '#/template/TemplateContainer';
import path from 'node:path';
import * as tsm from 'ts-morph';
import { beforeAll, describe, expect, it } from 'vitest';

describe('TemplateContainer', () => {
  beforeAll(async () => {
    await TemplateContainer.bootstrap({ templates: 'templates' });
  });

  it('bootstrap', async () => {
    const uuid = 'v1/superheros/avengers';
    const handlerDir = `handlers/${uuid}`;
    const handlerMethod = 'get.ts';

    const r01 = await TemplateContainer.it.evaluate('routing', {
      imports: [
        {
          hash: 'zLRHkFp00cylJZ0CJlgEiLOpyIGY5Pwl',
          namedBindings: [
            {
              name: 'option',
              alias: 'option_zLRHkFp00cylJZ0CJlgEiLOpyIGY5Pwl',
              isPureType: false,
            },
          ],
          importFile: path.join(process.cwd(), 'examples', handlerDir, handlerMethod),
          relativePath: '../handlers/get',
        },
      ],
      routes: [
        {
          methods: ['get'],
          routePath: '/v1/superhero/:name',
          hash: 'zLRHkFp00cylJZ0CJlgEiLOpyIGY5Pwl',
          hasOption: true,
          handlerName: 'handler_zLRHkFp00cylJZ0CJlgEiLOpyIGY5Pwl',
          typeArgument: {
            request: CE_REQUEST_KIND.FASTIFY_REQUEST,
            kind: tsm.SyntaxKind.TypeLiteral,
            text: '{ Querystring: IReadSuperheroQuerystring; Params: IReadSuperheroParams }',
          },
          sourceFilePath: path.join(process.cwd(), 'examples', handlerDir, handlerMethod),
        },
      ],
    });

    expect(r01.trim()).toEqual(
      `import  { option_zLRHkFp00cylJZ0CJlgEiLOpyIGY5Pwl } from '../handlers/get';

fastify.route<{ Querystring: IReadSuperheroQuerystring; Params: IReadSuperheroParams }>({
  ...option_zLRHkFp00cylJZ0CJlgEiLOpyIGY5Pwl,
  method: ["get"],
  url: '/v1/superhero/:name'
  handler: handler_zLRHkFp00cylJZ0CJlgEiLOpyIGY5Pwl,
});`.trim(),
    );
  });
});
