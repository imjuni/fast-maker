import posixJoin from '#tools/posixJoin';
import * as env from '#tools/__tests__/tools/env';
import path from 'path';

export default {
  hash: 'Bj1QDZJTGuSJNVowtarJ1NMW6qOmdwBA',
  namedBindings: [
    {
      name: '__type',
      alias: '__type_Bj1QDZJTGuSJNVowtarJ1NMW6qOmdwBA',
      isPureType: true,
    },
  ],
  importFile: posixJoin(path.resolve(env.examplePath, '..'), 'c1.ts'),
};
