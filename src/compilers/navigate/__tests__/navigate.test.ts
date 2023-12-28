import getHandlerWithOption from '#/compilers/navigate/getHandlerWithOption';
import getPropertySignatures from '#/compilers/navigate/getPropertySignatures';
import JestContext from '#/tools/__tests__/tools/context';
import { getExpectValue } from '@maeum/test-utility';
import 'jest';
import { atOrThrow } from 'my-easy-fp';
import { Node, Project, SyntaxKind } from 'ts-morph';

const context = new JestContext();

beforeAll(() => {
  context.project = new Project();
});

describe('getHandlerWithOption', () => {
  test('pass', async () => {
    const handlerFileInfos = getExpectValue(
      [
        {
          name: 't1.ts',
          content: 'export const option = {}; export default async function hello() { console.log("1"); }',
        },
        { name: 't2.ts', content: 'export const option = {}; export default async function () { console.log("1"); }' },
      ].map((source) => {
        const sourceFile = context.project.createSourceFile(source.name, source.content);
        const handlerFileInfo = getHandlerWithOption(sourceFile);

        return handlerFileInfo;
      }),
      (_, value: any) => {
        if (value === '[Circular]') return undefined;
        if (value instanceof Node) return undefined;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return value;
      },
      2,
    );

    const expectation = [
      { option: { kind: 'option' }, handler: { kind: 'handler', type: 'async', name: 'hello' } },
      { option: { kind: 'option' }, handler: { kind: 'handler', type: 'async', name: 'anonymous function' } },
    ];

    expect(handlerFileInfos).toMatchObject(expectation);
  });
});

describe('getPropertySignatures', () => {
  test('pass - FastifyRequest', async () => {
    const source = `import { FastifyRequest } from 'fastify';
    export default function handler(req: FastifyRequest<{ Querysting: { name: string }; Body: { name: string }; Headers: { name: string } }>) {}`;
    const sourceFile = context.project.createSourceFile('t10.ts', source);

    const parameter = atOrThrow(
      atOrThrow(sourceFile.getExportedDeclarations().get('default'), 0)
        .asKind(SyntaxKind.FunctionDeclaration)
        ?.getParameters(),
      0,
    );

    const propertySignatures = getPropertySignatures({ parameter });
    const names = propertySignatures.map((symbol) => symbol.getEscapedName());

    const expectation = ['Querysting', 'Body', 'Headers'];

    expect(names).toEqual(expectation);
  });

  test('pass - not FastifyRequest', async () => {
    const source = `import { FastifyReply } from 'fastify';
    export default function handler(reply: FastifyReply) {}`;
    const sourceFile = context.project.createSourceFile('t11.ts', source, { overwrite: true });

    const parameter = atOrThrow(
      atOrThrow(sourceFile.getExportedDeclarations().get('default'), 0)
        .asKind(SyntaxKind.FunctionDeclaration)
        ?.getParameters(),
      0,
    );

    const propertySignatures = getPropertySignatures({ parameter });
    const names = propertySignatures.map((symbol) => symbol.getEscapedName());

    const expectation = [
      'raw',
      'context',
      'log',
      'request',
      'server',
      'code',
      'status',
      'statusCode',
      'sent',
      'send',
      'header',
      'headers',
      'getHeader',
      'getHeaders',
      'removeHeader',
      'hasHeader',
      'redirect',
      'hijack',
      'callNotFound',
      'getResponseTime',
      'type',
      'serializer',
      'serialize',
      'getSerializationFunction',
      'compileSerializationSchema',
      'serializeInput',
      'then',
    ];

    expect(names).toEqual(expectation);
  });
});
