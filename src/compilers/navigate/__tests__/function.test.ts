import getFunctionDeclarationWithModifier from '#compilers/navigate/getFunctionDeclarationWithModifier';
import JestContext from '#tools/__tests__/tools/context';
import 'jest';
import { Project } from 'ts-morph';

const context = new JestContext();

beforeAll(() => {
  context.project = new Project();
});

describe('getFunctionDeclarationWithModifier', () => {
  test('anonymous function sync', async () => {
    const source = `import { FastifyReply, FastifyRequest } from 'fastify';
    export default function (req: FastifyRequest, reply: FastifyReply) {
      console.debug(req.query);
      console.debug(req.body);
      reply.send('hello');
    }`;

    const sourceFile = context.project.createSourceFile('f.ts', source, { overwrite: true });

    const declarationMap = sourceFile.getExportedDeclarations();
    const declarations = declarationMap.get('default') ?? [];
    const handlerStatement = getFunctionDeclarationWithModifier(declarations);

    if (handlerStatement == null) {
      throw new Error('handler statement empty');
    }

    const { node, ...processed } = handlerStatement;
    const expectation = {
      kind: 'handler',
      type: 'sync',
      name: 'anonymous function',
    };

    console.log(processed);

    expect(processed).toEqual(expectation);
  });

  test('anonymous function async', async () => {
    const source = `import { FastifyReply, FastifyRequest } from 'fastify';
    export default async function (req: FastifyRequest, reply: FastifyReply) {
      console.debug(req.query);
      console.debug(req.body);
      reply.send('hello');
    }`;

    const sourceFile = context.project.createSourceFile('f.ts', source, { overwrite: true });

    const declarationMap = sourceFile.getExportedDeclarations();
    const declarations = declarationMap.get('default') ?? [];
    const handlerStatement = getFunctionDeclarationWithModifier(declarations);

    if (handlerStatement == null) {
      throw new Error('handler statement empty');
    }

    // eslint-disable-next-line
    const { node: _node, ...processed } = handlerStatement;
    const expectation = {
      kind: 'handler',
      type: 'async',
      name: 'anonymous function',
    };

    console.log(processed);

    expect(processed).toEqual(expectation);
  });

  test('named function async', async () => {
    const source = `import { FastifyReply, FastifyRequest } from 'fastify';

    export default function namedFunc(req: FastifyRequest, reply: FastifyReply) {
      console.debug(req.query);
      console.debug(req.body);
      reply.send('hello');
    }`;

    const sourceFile = context.project.createSourceFile('f.ts', source, { overwrite: true });

    const declarationMap = sourceFile.getExportedDeclarations();
    const declarations = declarationMap.get('default') ?? [];
    const handlerStatement = getFunctionDeclarationWithModifier(declarations);

    if (handlerStatement == null) {
      throw new Error('handler statement empty');
    }

    // eslint-disable-next-line
    const { node: _node, ...processed } = handlerStatement;
    const expectation = {
      kind: 'handler',
      type: 'sync',
      name: 'namedFunc',
    };

    console.log(processed);

    expect(processed).toEqual(expectation);
  });

  test('named function async', async () => {
    const source = `import { FastifyReply, FastifyRequest } from 'fastify';

    export default async function namedFunc(req: FastifyRequest, reply: FastifyReply) {
      console.debug(req.query);
      console.debug(req.body);
      reply.send('hello');
    }`;

    const sourceFile = context.project.createSourceFile('f.ts', source, { overwrite: true });

    const declarationMap = sourceFile.getExportedDeclarations();
    const declarations = declarationMap.get('default') ?? [];
    const handlerStatement = getFunctionDeclarationWithModifier(declarations);

    if (handlerStatement == null) {
      throw new Error('handler statement empty');
    }

    // eslint-disable-next-line
    const { node: _node, ...processed } = handlerStatement;
    const expectation = {
      kind: 'handler',
      type: 'async',
      name: 'namedFunc',
    };

    console.log(processed);

    expect(processed).toEqual(expectation);
  });
});
