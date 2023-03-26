import * as env from '#tools/__tests__/tools/env';
import posixJoin from '#tools/posixJoin';

export default {
  messages: [
    {
      type: 'error',
      filePath: posixJoin(env.handlerPath, 'get/po-ke/c1.ts'),
      lineAndCharacter: {
        line: 15,
        character: 7,
      },
      message: 'synchronous route handler have to do send response data using reply.send function',
    },
  ],
  importBox: {},
  routeBox: {},
};
