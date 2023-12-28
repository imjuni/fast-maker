import * as env from '#/tools/__tests__/tools/env';
import posixJoin from '#/tools/posixJoin';

export default [
  {
    hash: 'xRUdOLAVNLGelsnvuUdCr2imEOXyGOtW',
    namedBindings: [
      {
        name: '__type',
        alias: '__type_xRUdOLAVNLGelsnvuUdCr2imEOXyGOtW',
        isPureType: true,
      },
    ],
    importFile: posixJoin(env.handlerPath, 'get', 'c2.ts'),
  },
];
