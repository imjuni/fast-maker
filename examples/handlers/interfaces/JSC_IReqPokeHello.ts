import { JSONSchema7 } from 'json-schema';

// eslint-disable-next-line @typescript-eslint/naming-convention
const JSC_IReqPokeHello: JSONSchema7 = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    Body: {
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
    Querystring: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
      },
      required: ['name'],
    },
    Params: {},
    Headers: {},
  },
  required: ['Querystring', 'Body'],
  definitions: {},
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export default JSC_IReqPokeHello;
