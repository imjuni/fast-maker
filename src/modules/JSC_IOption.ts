import { JSONSchema7 } from 'json-schema';

// eslint-disable-next-line
const JSC_IOption: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    path: {
      type: 'object',
      properties: {
        api: {
          type: 'string',
          description: 'path of the api handler',
        },
        page: {
          type: 'string',
          description: 'path of the next.js page prefetch handler',
        },
        output: {
          type: 'string',
          description: 'generated "route.ts" file on store this directory',
        },
        tsconfig: {
          type: 'string',
          description: 'path of the tsconfig file. Because fast-maker use typescript compiler api.',
        },
      },
      required: ['api', 'output', 'tsconfig'],
    },
    prefix: {
      type: 'object',
      properties: {
        api: {
          type: 'string',
        },
        page: {
          type: 'string',
        },
      },
    },
    template: {
      type: 'object',
      properties: {
        api: {
          type: 'object',
          properties: {
            import: {
              type: 'object',
              properties: {
                async: {
                  type: 'string',
                },
                sync: {
                  type: 'string',
                },
                all: {
                  type: 'string',
                },
              },
              required: ['async', 'sync', 'all'],
            },
            wrapper: {
              type: 'object',
              properties: {
                async: {
                  type: 'string',
                },
                sync: {
                  type: 'string',
                },
              },
              required: ['async', 'sync'],
            },
          },
          description: 'api route template',
        },
        page: {
          type: 'object',
          properties: {
            import: {
              type: 'object',
              properties: {
                async: {
                  type: 'string',
                },
                sync: {
                  type: 'string',
                },
                all: {
                  type: 'string',
                },
              },
              required: ['async', 'sync', 'all'],
            },
            wrapper: {
              type: 'object',
              properties: {
                async: {
                  type: 'string',
                },
                sync: {
                  type: 'string',
                },
              },
              required: ['async', 'sync'],
            },
          },
        },
      },
      description: 'template of route.ts',
    },
  },
  required: ['path'],
  definitions: {},
};

// eslint-disable-next-line camelcase
export default JSC_IOption;
