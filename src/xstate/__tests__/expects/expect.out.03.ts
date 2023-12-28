import * as env from '#/tools/__tests__/tools/env';
import posixJoin from '#/tools/posixJoin';

export default {
  messages: [],
  importBox: {
    [posixJoin(env.handlerPath, 'delete', 'hello.ts')]: {
      hash: 'JBEumYWpspHJFAhjbctT6IF9XOfwQ0fj',
      namedBindings: [],
      nonNamedBinding: 'hello_JBEumYWpspHJFAhjbctT6IF9XOfwQ0fj',
      importFile: posixJoin(env.handlerPath, 'delete', 'hello.ts'),
    },
  },
  routeBox: {
    [posixJoin(env.handlerPath, 'delete', 'hello.ts')]: {
      hash: 'JBEumYWpspHJFAhjbctT6IF9XOfwQ0fj',
      hasOption: false,
      method: 'delete',
      routePath: '/hello',
      handlerName: 'hello_JBEumYWpspHJFAhjbctT6IF9XOfwQ0fj',
      sourceFilePath: posixJoin(env.handlerPath, 'delete', 'hello.ts'),
    },
  },
};
