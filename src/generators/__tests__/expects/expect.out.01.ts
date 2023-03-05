import posixJoin from '#tools/posixJoin';
import * as env from '#tools/__tests__/tools/env';

export default [
  {
    hash: 'tAvWUdFjzhE0TnlMjmWEA3tP7X20emot',
    namedBindings: [
      {
        name: '__type',
        alias: '__type_tAvWUdFjzhE0TnlMjmWEA3tP7X20emot',
        isPureType: true,
      },
    ],
    importFile: posixJoin(env.handlerPath, 'get', 'c1.ts'),
  },
];
