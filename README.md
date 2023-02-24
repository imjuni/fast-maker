# Introduction

![ts](https://flat.badgen.net/badge/Built%20With/TypeScript/blue)
[![Download Status](https://img.shields.io/npm/dw/fast-maker.svg?style=flat-square)](https://npmcharts.com/compare/fast-maker?minimal=true)
[![Github Star](https://img.shields.io/github/stars/imjuni/fast-maker.svg?style=flat-square)](https://github.com/imjuni/fast-maker)
[![Github Issues](https://img.shields.io/github/issues-raw/imjuni/fast-maker.svg?style=flat-square)](https://github.com/imjuni/fast-maker/issues)
[![NPM version](https://img.shields.io/npm/v/fast-maker.svg?style=flat-square)](https://www.npmjs.com/package/fast-maker)
[![License](https://img.shields.io/npm/l/fast-maker.svg)](https://github.com/imjuni/fast-maker/blob/master/LICENSE?style=flat-square)
[![fast-maker](https://circleci.com/gh/imjuni/fast-maker.svg??style=flat-square)](https://app.circleci.com/pipelines/github/imjuni/fast-maker?branch=master)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

fast-maker is micro utility for [fastify.js](https://www.fastify.io/) over 3.x. fast-maker inspired by codeigniter(in PHP) and Next.js directory structure based route system. fast-maker auto generate route.ts file using directory structure futhermore include type declaration that inheritance RequestGenericInterface. This method have varity benefits.

1. So keep similar code style of route handler function
1. More focus about business logic
1. Recognize route path using by directory structure

![fast-maker-showcase.gif](assets/fast-maker-showcase.gif)

| directory structure                                        |     | route function                                     |
| ---------------------------------------------------------- | --- | -------------------------------------------------- |
| ![directory_structure.png](assets/directory_structure.png) | ➜   | ![route_config_ts.png](assets/route_config_ts.png) |

Yes, `fast-maker` automatic generation route function!

## Installation

```basn
npm i fast-maker --save-dev
```

## Usage

fast-maker need two option. handlers directory and tsconfig.json file. Or you can create .fastmakerrc.

```bash
# with option
fast-maker -h <your ruote handler directory>

# with .fastmakerrc
fast-maker -c ./.configs/.fastmakerrc
```

## Detail option

|    name    | required | alias | desc.                                                                                                         |
| :--------: | :------: | :---: | :------------------------------------------------------------------------------------------------------------ |
| --handler  | required |  -a   | API handler directory                                                                                         |
| --project  | required |  -p   | tsconfig path                                                                                                 |
|  --output  |          |  -o   | route.ts file generate on output directory. Default value is route handler directory(--handler option passed) |
| --verbose  |          |  -v   | verbose message display                                                                                       |
| --debugLog |          |  -d   | generate debug log file                                                                                       |
|  --config  |          |  -c   | configuration file load given directory                                                                       |

## Constraints

1. Typescript only
1. Directory structure is route path
1. Single file, Single route
1. Hash

### TypeScript only

fast-maker based on TypeScript type system and use TypeScript compiler API(using ts-morph). Therefore only work on TypeScript project.

### Directory structure is route path

fast-maker inspired by CodeIgniter and Next.js routing system. fast-maker using specific directory name use to method discrimination. So fast-maker need get, post, put, delete, etc directory need to method discrimination.

#### method

get, post, put, delete, all, etc directory bind method

- as-is: \<your project>/src/handlers/get/utility/health_check
- to-be: server.get('/utility/health_check')

- as-is: \<your project>/src/handlers/post/articles
- to-be: server.post('/articles')

#### path parameter

square brackets replace to path parameter

- as-is: \<your project>/src/handlers/get/articles/[id].ts
- to-be: server.get('/articles/:id')

- as-is: \<your project>/src/handlers/get/major/[majorId]/student/[studentId].ts
- to-be: server.get('/major/:majorId/student/:studentId')

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
// get/poke/world.ts
const world = async (
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
fastify.get<{
  // if IReqPokeHello interface in your typescript project, fast-maker append postfix hash.
  // Because error prevent raise by same name interface import
  Querystring: IReqPokeHello_052A3A1D6C6D4FFC835C4EB7F39FE90E['Querystring'];
  Body: IReqPokeHello_052A3A1D6C6D4FFC835C4EB7F39FE90E['Body'];
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
}>('/po-ke/world', option_nPZHxkE1fH4b3EascyCyIFc8UqLca2bc, world_nPZHxkE1fH4b3EascyCyIFc8UqLca2bc);
```

Don't worry about request type arguments, detail type declare and error prevent!

## RouteShorthandOptions

Named export `option` variable use to RouteShorthandOptions. I recommand using [simple-tjscli](https://www.npmjs.com/package/simple-tjscli). or [crate-ts-json-schema](https://github.com/imjuni/create-ts-json-schema). simple-tjscli, create-ts-json-schema can transfile TypeScript interface to JSONSchema. So you can pass like that.

```ts
// simple-tjscli
export const option: RouteShorthandOptions = {
  schema: {
    querystring: schema.properties?.Querystring,
    body: schema.properties?.Body,
  },
};

// create-ts-json-schema
export const option: RouteShorthandOptions = {
  schema: {
    querystring: { $ref: 'your-json-schema-name-of-querystring' },
    body: { $ref: 'your-json-schema-name-of-body' },
  },
};
```

If you using [@fastify/swagger](https://www.npmjs.com/package/@fastify/swagger), JSONSchema will be create swagger.io document.

## .fastmakerrc file

You can use .fastmakerrc file for configuration. fast-maker use jsonc parser for configuration file. See below.

```jsonc
{
  "project": "./server/tsconfig.json",
  "handler": "./server/handlers/api",
  "output": "./server/handlers"
}
```
