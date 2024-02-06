# Advance Topics

## Table of Contents <!-- omit in toc -->

- [Constraints](#constraints)
  - [TypeScript only](#typescript-only)
  - [Single file, Single route](#single-file-single-route)
  - [Hash](#hash)
- [Type declaration for FastifyRequest](#type-declaration-for-fastifyrequest)
- [RouteShorthandOptions](#routeshorthandoptions)

## Constraints

1. Typescript only
1. Single file, Single route
1. Hash

### TypeScript only

fast-maker based on TypeScript type system and use TypeScript compiler API(using ts-morph). Therefore only work on TypeScript project.

### Single file, Single route

fast-maker using default function to handler function. `option` variable use to `RouteShorthandOptions`.

### Hash

For example, option is same name every file. Also route handler can have same filename in many directory. Therefore fast-maker add hash each route handler and option. Like below example.

```ts
import IReqPokeHello from './get/interface/IReqPokeHello';
import hello_bc1Vxcm2acwx2zx33spLFPqxVvROeeVa, {
  option as option_bc1Vxcm2acwx2zx33spLFPqxVvROeeVa,
} from './get/po-ke/hello';

fastify.get<IReqPokeHello>(
  '/po-ke/hello',
  option_bc1Vxcm2acwx2zx33spLFPqxVvROeeVa,
  hello_bc1Vxcm2acwx2zx33spLFPqxVvROeeVa,
);
```

Hash create by resolved full-directory. And hash use crypto.createHmac function. So, if you donot change directory structure that always same string.

## Type declaration for FastifyRequest

fast-maker support FastifyRequest type argument. see below.

```ts
// poke/world/get.ts
export const handler = async (
  req: FastifyRequest<
    {
      Querystring: IReqPokeHello['Querystring'];
      Body: IReqPokeHello['Body'];
      Headers: {
        'access-token': string;
        'refresh-token': string;
        'expire-time': {
          token: string;
          expire: number;
          site: {
            host: string;
            port: number;
          };
        };
      };
    },
    Server
  >,
  _reply: FastifyReply,
) => {
  console.debug(req.query);
  console.debug(req.body);

  return 'world';
};

// generated code
fastify.route<{
  Querystring: IReqPokeHello['Querystring'];
  Body: IReqPokeHello['Body'];
  Headers: {
    'access-token': string;
    'refresh-token': string;
    'expire-time': {
      token: string;
      expire: number;
      site: {
        host: string;
        port: number;
      };
    };
  };
}>({
  ...option_nPZHxkE1fH4b3EascyCyIFc8UqLca2bc, 
  url: '/po-ke/world',
  handler: world_nPZHxkE1fH4b3EascyCyIFc8UqLca2bc,
});
```

Don't worry about request type arguments, detail type declare and error prevent!

## RouteShorthandOptions

Named export `option` variable use to RouteShorthandOptions. I recommand using [simple-tjscli](https://www.npmjs.com/package/simple-tjscli). or [schema-nozzle](https://github.com/imjuni/schema-nozzle). simple-tjscli, schema-nozzle can transfile TypeScript interface to JSONSchema. So you can pass like that.

```ts
// simple-tjscli
export const option: RouteShorthandOptions = {
  schema: {
    querystring: schema.properties?.Querystring,
    body: schema.properties?.Body,
  },
};

// schema-nozzle
export const option: RouteShorthandOptions = {
  schema: {
    querystring: { $ref: 'your-json-schema-name-of-querystring' },
    body: { $ref: 'your-json-schema-name-of-body' },
  },
};
```

If you using [@fastify/swagger](https://www.npmjs.com/package/@fastify/swagger), JSONSchema will be create swagger.io document.
