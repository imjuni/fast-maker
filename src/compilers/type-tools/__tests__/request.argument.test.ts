import { getRouteNodeOrThrow } from '#/compilers/routes/getRouteNodeOrThrow';
import { CE_REQUEST_KIND } from '#/compilers/type-tools/const-enum/CE_REQUEST_KIND';
import { getFastifyRequestTypeArgument } from '#/compilers/type-tools/getFastifyRequestTypeArgument';
import { getTypePropertySignature } from '#/compilers/type-tools/getTypePropertySignature';
import { atOrThrow } from 'my-easy-fp';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import * as tsm from 'ts-morph';
import { describe, expect, it } from 'vitest';

const tsconfigDir = path.join(process.cwd(), 'examples');
const tsconfigPath = path.join(tsconfigDir, 'tsconfig.example.json');
const project = new tsm.Project({ tsConfigFilePath: tsconfigPath });
const context: { index: number } = { index: 0 };

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

describe('getRequestTypeArgument', () => {
  // ------------------------------------------------------------------------------------------
  // FastifyRequest
  // ------------------------------------------------------------------------------------------
  describe('FastifyRequest', () => {
    it('without type arguments', () => {
      const uuid = randomUUID();
      const handlerDir = `handlers/${uuid}_0${(context.index += 1)}`;
      const handlerMethod = 'get.ts';
      const source02 = `${importSourceCode}
  ${mapSourceCode}
  
  ${extraMethodSourceCode}
  
  ${optionsSourceCode}
  
  export function handler(req: FastifyRequest) {
    return req.body;
  }`;

      const pathjoin = (...dir: string[]) => path.join(tsconfigDir, ...dir);
      const sourceFile02 = project.createSourceFile(pathjoin(handlerDir, handlerMethod), source02.trim(), {
        overwrite: true,
      });
      const node = getRouteNodeOrThrow(sourceFile02);
      const parameter = atOrThrow(node.node.getParameters(), 0);

      const r01 = getFastifyRequestTypeArgument(parameter);

      expect(r01).toMatchObject({
        request: CE_REQUEST_KIND.FASTIFY_REQUEST,
        kind: undefined,
        text: '',
      });
    });

    it('type literal', () => {
      const uuid = randomUUID();
      const handlerDir = `handlers/${uuid}_0${(context.index += 1)}`;
      const handlerMethod = 'get.ts';
      const source02 = `${importSourceCode}
  ${mapSourceCode}
  
  ${extraMethodSourceCode}
  
  ${optionsSourceCode}
  
  export function handler(req: FastifyRequest<{ Body: ITestInfoType01, Querystring: ITestInfoType01 }>) {
    return req.body;
  }`;

      const pathjoin = (...dir: string[]) => path.join(tsconfigDir, ...dir);
      const sourceFile02 = project.createSourceFile(pathjoin(handlerDir, handlerMethod), source02.trim(), {
        overwrite: true,
      });
      const node = getRouteNodeOrThrow(sourceFile02);
      const parameter = atOrThrow(node.node.getParameters(), 0);

      const r01 = getFastifyRequestTypeArgument(parameter);

      expect(r01).toMatchObject({
        request: CE_REQUEST_KIND.FASTIFY_REQUEST,
        kind: tsm.SyntaxKind.TypeLiteral,
        text: '{ Body: ITestInfoType01, Querystring: ITestInfoType01 }',
      });
    });

    it('type alias', () => {
      const uuid = randomUUID();
      const handlerDir = `handlers/${uuid}_0${(context.index += 1)}`;
      const handlerMethod = 'get.ts';
      const source02 = `${importSourceCode}
  ${mapSourceCode}
  
  ${extraMethodSourceCode}
  
  ${optionsSourceCode}
  
  type TReq = {
    Body: ITestInfoType01;
    Querystring: ITestInfoType01
  }
  
  export function handler(req: FastifyRequest<TReq>) {
    return req.body;
  }`;

      const pathjoin = (...dir: string[]) => path.join(tsconfigDir, ...dir);
      const sourceFile02 = project.createSourceFile(pathjoin(handlerDir, handlerMethod), source02.trim(), {
        overwrite: true,
      });
      const node = getRouteNodeOrThrow(sourceFile02);
      const parameter = atOrThrow(node.node.getParameters(), 0);

      const r01 = getFastifyRequestTypeArgument(parameter);

      expect(r01).toMatchObject({
        request: CE_REQUEST_KIND.FASTIFY_REQUEST,
        kind: tsm.SyntaxKind.TypeReference,
        text: 'TReq',
      });
    });

    it('interface', () => {
      const uuid = randomUUID();
      const handlerDir = `handlers/${uuid}_0${(context.index += 1)}`;
      const handlerMethod = 'get.ts';
      const source02 = `${importSourceCode}
    ${mapSourceCode}
  
    ${extraMethodSourceCode}
  
    ${optionsSourceCode}
  
    interface IReq {
      Body: ITestInfoType01;
      Querystring: ITestInfoType01
    }
  
    export function handler(req: FastifyRequest<IReq>) {
      return req.body;
    }`;

      const pathjoin = (...dir: string[]) => path.join(tsconfigDir, ...dir);
      const sourceFile02 = project.createSourceFile(pathjoin(handlerDir, handlerMethod), source02.trim(), {
        overwrite: true,
      });
      const node = getRouteNodeOrThrow(sourceFile02);
      const parameter = atOrThrow(node.node.getParameters(), 0);

      const r01 = getFastifyRequestTypeArgument(parameter);

      expect(r01).toMatchObject({
        request: CE_REQUEST_KIND.FASTIFY_REQUEST,
        kind: tsm.SyntaxKind.TypeReference,
        text: 'IReq',
      });
    });

    it('class', () => {
      const uuid = randomUUID();
      const handlerDir = `handlers/${uuid}_0${(context.index += 1)}`;
      const handlerMethod = 'get.ts';
      const source02 = `${importSourceCode}
    ${mapSourceCode}
  
    ${extraMethodSourceCode}
  
    ${optionsSourceCode}
  
    class CReq {
      Body: ITestInfoType01;
      Querystring: ITestInfoType01
    }
  
    export function handler(req: FastifyRequest<CReq>) {
      return req.body;
    }`;

      const pathjoin = (...dir: string[]) => path.join(tsconfigDir, ...dir);
      const sourceFile02 = project.createSourceFile(pathjoin(handlerDir, handlerMethod), source02.trim(), {
        overwrite: true,
      });
      const node = getRouteNodeOrThrow(sourceFile02);
      const parameter = atOrThrow(node.node.getParameters(), 0);

      const r01 = getFastifyRequestTypeArgument(parameter);

      expect(r01).toMatchObject({
        request: CE_REQUEST_KIND.FASTIFY_REQUEST,
        kind: tsm.SyntaxKind.TypeReference,
        text: 'CReq',
      });
    });
  });

  // ------------------------------------------------------------------------------------------
  // Custom Type Literal
  // ------------------------------------------------------------------------------------------
  describe('Custom Type Literal', () => {
    it('type literal', () => {
      const uuid = randomUUID();
      const handlerDir = `handlers/${uuid}_0${(context.index += 1)}`;
      const handlerMethod = 'get.ts';
      const source02 = `${importSourceCode}
  ${mapSourceCode}
  
  ${extraMethodSourceCode}
  
  ${optionsSourceCode}
  
  export function handler(req: { Body: ITestInfoType01, Querystring: ITestInfoType01 }) {
    return req.body;
  }`;

      const pathjoin = (...dir: string[]) => path.join(tsconfigDir, ...dir);
      const sourceFile02 = project.createSourceFile(pathjoin(handlerDir, handlerMethod), source02.trim(), {
        overwrite: true,
      });
      const node = getRouteNodeOrThrow(sourceFile02);
      const parameter = atOrThrow(node.node.getParameters(), 0);

      const r01 = getTypePropertySignature(parameter);

      expect(r01).toMatchObject({
        request: CE_REQUEST_KIND.PROPERTY_SIGNATURE,
        kind: tsm.SyntaxKind.TypeLiteral,
        text: '{ Body: ITestInfoType01, Querystring: ITestInfoType01 }',
      });
    });

    it('type alias', () => {
      const uuid = randomUUID();
      const handlerDir = `handlers/${uuid}_0${(context.index += 1)}`;
      const handlerMethod = 'get.ts';
      const source02 = `${importSourceCode}
  ${mapSourceCode}
  
  ${extraMethodSourceCode}
  
  ${optionsSourceCode}
  
  type TReq = {
    Body: ITestInfoType01;
    Querystring: ITestInfoType01
  }
  
  export function handler(req: TReq) {
    return req.body;
  }`;

      const pathjoin = (...dir: string[]) => path.join(tsconfigDir, ...dir);
      const sourceFile02 = project.createSourceFile(pathjoin(handlerDir, handlerMethod), source02.trim(), {
        overwrite: true,
      });
      const node = getRouteNodeOrThrow(sourceFile02);
      const parameter = atOrThrow(node.node.getParameters(), 0);

      const r01 = getTypePropertySignature(parameter);

      expect(r01).toMatchObject({
        request: CE_REQUEST_KIND.PROPERTY_SIGNATURE,
        kind: tsm.SyntaxKind.TypeReference,
        text: 'TReq',
      });
    });

    it('interface', () => {
      const uuid = randomUUID();
      const handlerDir = `handlers/${uuid}_0${(context.index += 1)}`;
      const handlerMethod = 'get.ts';
      const source02 = `${importSourceCode}
    ${mapSourceCode}
  
    ${extraMethodSourceCode}
  
    ${optionsSourceCode}
  
    interface IReq {
      Body: ITestInfoType01;
      Querystring: ITestInfoType01
    }
  
    export function handler(req: IReq) {
      return req.body;
    }`;

      const pathjoin = (...dir: string[]) => path.join(tsconfigDir, ...dir);
      const sourceFile02 = project.createSourceFile(pathjoin(handlerDir, handlerMethod), source02.trim(), {
        overwrite: true,
      });
      const node = getRouteNodeOrThrow(sourceFile02);
      const parameter = atOrThrow(node.node.getParameters(), 0);

      const r01 = getTypePropertySignature(parameter);

      expect(r01).toMatchObject({
        request: CE_REQUEST_KIND.PROPERTY_SIGNATURE,
        kind: tsm.SyntaxKind.TypeReference,
        text: 'IReq',
      });
    });

    it('class', () => {
      const uuid = randomUUID();
      const handlerDir = `handlers/${uuid}_0${(context.index += 1)}`;
      const handlerMethod = 'get.ts';
      const source02 = `${importSourceCode}
    ${mapSourceCode}
  
    ${extraMethodSourceCode}
  
    ${optionsSourceCode}
  
    class CReq {
      Body: ITestInfoType01;
      Querystring: ITestInfoType01
    }
  
    export function handler(req: CReq) {
      return req.body;
    }`;

      const pathjoin = (...dir: string[]) => path.join(tsconfigDir, ...dir);
      const sourceFile02 = project.createSourceFile(pathjoin(handlerDir, handlerMethod), source02.trim(), {
        overwrite: true,
      });
      const node = getRouteNodeOrThrow(sourceFile02);
      const parameter = atOrThrow(node.node.getParameters(), 0);

      const r01 = getTypePropertySignature(parameter);

      expect(r01).toMatchObject({
        request: CE_REQUEST_KIND.PROPERTY_SIGNATURE,
        kind: tsm.SyntaxKind.TypeReference,
        text: 'CReq',
      });
    });
  });
});
