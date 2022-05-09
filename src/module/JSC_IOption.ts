import { JSONSchema7 } from 'json-schema';

// eslint-disable-next-line @typescript-eslint/naming-convention
const JSC_IOption: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    project: {
      type: 'string',
      description: 'path of the tsconfig file. Because fast-maker use typescript compiler api.',
    },
    path: {
      type: 'object',
      properties: {
        handler: {
          type: 'string',
          description: 'path of the api handler',
        },
        output: {
          type: 'string',
          description: 'generated "route.ts" file on store this directory',
        },
      },
      required: ['handler', 'output'],
    },
  },
  required: ['project', 'path'],
  definitions: {},
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export default JSC_IOption;
