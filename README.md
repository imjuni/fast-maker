# Introduction
fast-maker is micro utility for fastify.js user. fast-maker route configuration generate using directory structure. Also pass additional route option and route prefix. fast-maker design for fastify.js server application and next.js custom server using by fastify.js. If you have experience use next.js, fast-maker very simular working for route generation. 

# Installation
```basn
npm i --save-dev fast-maker
```

# Constraints
1. Typescript only
2. Directory structure is route path
    * <your project>/handlers/get/utility/health_check > server.get('/utility/health_check')
    * get, post, put, delete directory don't include route path but use http method
3. Single file, Single route
    * fast-maker use default function to route
4. Named variable "option" are passed fastify.js route option
    * option variable have to exported, don't use default export

## Why typescript only?
fast-maker use compiler API for handler function analysis. For example, detect sync/async and detect name and variety information. At this time, I can't integrate javascript interpreter because I don't found programmable javascript interpreter API. So fast-maker only works on typescript code.

# How it works?
You can pass three option. handlers directory and tsconfig.json file. 

```
fast-maker -a <your handler directory> -t <your tsconfig file> -o <output directory>
```

## Detail option
| name | alias | desc. |
| - | - | - |
| --path-api | -a | API handler directory |
| --path-page | -p | Next.js page prefetch handler directory |
| --path-tsconfig | -t | tsconfig path |
| --path-output | -o | output directory |
| --prefix-api | N/A | API handler route prefix, ex> /api/<directory structure route path> |
| --prefix-page | N/A | Next.js page prefetch handler route prefix, ex> /page/<directory structure route path>  |
| --template-api-import-all | N/A | If you use wrapper function for api handler, describe import statement in this option. This option present all(async, sync wrapper function) case import statement |
| --template-api-import-async | N/A | If you use wrapper function for api handler, describe import statement in this option. This option present async wrapper function case import statement |
| --template-api-import-sync | N/A | If you use wrapper function for api handler, describe import statement in this option. This option present sync wrapper function case import statement |
| --template-api-wrapper-async | N/A | name of async wrapper function  |
| --template-api-wrapper-sync | N/A | name of sync wrapper function |
| --template-page-import-all | N/A | If you use wrapper function for page prefetch handler, describe import statement in this option. This option present all(async, sync wrapper function) case import statement |
| --template-page-import-async | N/A | If you use wrapper function for page prefetch handler, describe import statement in this option. This option present async wrapper function case import statement |
| --template-page-import-sync | N/A | If you use wrapper function for page prefetch handler, describe import statement in this option. This option present sync wrapper function case import statement |
| --template-page-wrapper-async | N/A | name of async wrapper function |
| --template-page-wrapper-sync | N/A | name of sync wrapper function |

## .fastmakerrc file
You can use .fastmakerrc file for configuration. fast-maker use json5 parser for configuration file. See below, that case for Next.js custom server usecase.

```json5
{
  "path": {
    "api": "./server/handlers/api",
    "page": "./server/handlers/pages",
    "output": "./server/handlers",
    "tsconfig": "./server/tsconfig.json"
  }, 
  "prefix": {
    "api": "api"
  },
  "template": {
    "api": {
      "import": {
        "all": "import { asyncAPIWarp, syncAPIWarp } from '@tools/wrap';",
        "async": "import { asyncAPIWarp } from '@tools/wrap';",
        "sync": "import { syncAPIWarp } from '@tools/wrap';"
      },
      "wrapper": {
        "async": "asyncAPIWarp",
        "sync": "syncAPIWarp"
      },
    },
    "page": {
      "import": {
        "all": "import { renderWrap } from '@tools/renderWrap'",
        "async": "import { renderWrap } from '@tools/renderWrap'",
        "sync": "import { renderWrap } from '@tools/renderWrap'"
      },
      "wrapper": {
        "async": "renderWrap",
        "sync": "renderWrap"
      }
    }
  },
}
```