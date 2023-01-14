import getFunctionDeclarationWithModifier from '#compiler/navigate/getFunctionDeclarationWithModifier';
import logger from '#module/logging/logger';
import * as env from '#test-tools/env';
import 'jest';
import { replaceSepToPosix } from 'my-node-fp';
import path from 'path';
import * as tsm from 'ts-morph';

const share: { projectPath: string; project: tsm.Project } = {} as any;
const log = logger();

beforeAll(async () => {
  share.projectPath = path.join(env.examplePath, 'tsconfig.json');
  share.project = new tsm.Project({ tsConfigFilePath: share.projectPath });
});

describe('getFunctionDeclarationWithModifier', () => {
  test('anonymous function sync', async () => {
    const sourcePath = replaceSepToPosix(path.join(env.examplePath, 'handlers\\get\\xman\\fastify.ts'));
    const source = share.project.getSourceFileOrThrow(sourcePath);

    const declarationMap = source.getExportedDeclarations();
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
      name: 'anonymous function',
    };

    log.info(processed);

    expect(processed).toEqual(expectation);
  });

  test('anonymous function async', async () => {
    const sourceFileContent = `import { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
    import type IReqPokeHello from '../interface/IReqPokeHello';
    import schema from '../interface/JSC_IReqPokeHello';
    
    export const option: RouteShorthandOptions = {
      schema: {
        querystring: schema.properties?.Querystring,
        body: schema.properties?.Body,
      },
    };
    
    // eslint-disable-next-line func-names
    export default async function (req: FastifyRequest<IReqPokeHello>, reply: FastifyReply) {
      console.debug(req.query);
      console.debug(req.body);
    
      reply.send('hello');
    }`;
    const sourcePath = replaceSepToPosix(path.join(env.examplePath, 'handlers\\get\\xman\\fastify.ts'));
    const source = share.project.createSourceFile(sourcePath, sourceFileContent, { overwrite: true });

    const declarationMap = source.getExportedDeclarations();
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

    log.info(processed);

    expect(processed).toEqual(expectation);
  });

  test('named function async', async () => {
    const sourceFileContent = `import { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
    import type IReqPokeHello from '../interface/IReqPokeHello';
    import schema from '../interface/JSC_IReqPokeHello';
    
    export const option: RouteShorthandOptions = {
      schema: {
        querystring: schema.properties?.Querystring,
        body: schema.properties?.Body,
      },
    };
    
    // eslint-disable-next-line func-names
    export default function namedFunc(req: FastifyRequest<IReqPokeHello>, reply: FastifyReply) {
      console.debug(req.query);
      console.debug(req.body);
    
      reply.send('hello');
    }`;
    const sourcePath = replaceSepToPosix(path.join(env.examplePath, 'handlers\\get\\xman\\fastify.ts'));
    const source = share.project.createSourceFile(sourcePath, sourceFileContent, { overwrite: true });

    const declarationMap = source.getExportedDeclarations();
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

    log.info(processed);

    expect(processed).toEqual(expectation);
  });

  test('named function async', async () => {
    const sourceFileContent = `import { FastifyReply, FastifyRequest, RouteShorthandOptions } from 'fastify';
    import type IReqPokeHello from '../interface/IReqPokeHello';
    import schema from '../interface/JSC_IReqPokeHello';
    
    export const option: RouteShorthandOptions = {
      schema: {
        querystring: schema.properties?.Querystring,
        body: schema.properties?.Body,
      },
    };
    
    // eslint-disable-next-line func-names
    export default async function namedFunc(req: FastifyRequest<IReqPokeHello>, reply: FastifyReply) {
      console.debug(req.query);
      console.debug(req.body);
    
      reply.send('hello');
    }`;
    const sourcePath = replaceSepToPosix(path.join(env.examplePath, 'handlers\\get\\xman\\fastify.ts'));
    const source = share.project.createSourceFile(sourcePath, sourceFileContent, { overwrite: true });

    const declarationMap = source.getExportedDeclarations();
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

    log.info(processed);

    expect(processed).toEqual(expectation);
  });
});
