import * as env from '#/tools/__tests__/tools/env';
import posixJoin from '#/tools/posixJoin';

export default {
  messages: [
    {
      type: 'error',
      filePath: posixJoin(env.handlerPath, 'post/dc/world.ts'),
      lineAndCharacter: {
        line: 10,
        character: 1,
      },
      message: 'not export type alias: __type',
    },
  ],
  importBox: {},
  routeBox: {},
};
