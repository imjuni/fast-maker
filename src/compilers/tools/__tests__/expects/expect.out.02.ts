import posixJoin from '#tools/posixJoin';
import * as env from '#tools/__tests__/tools/env';
import path from 'path';

export default [
  {
    isExternalLibraryImport: false,
    hash: 'Bj1QDZJTGuSJNVowtarJ1NMW6qOmdwBA',
    importAt: posixJoin(path.resolve(env.examplePath, '..'), 'c1.ts'),
    exportFrom: posixJoin(path.resolve(env.examplePath, '..'), 'c1.ts'),
    importDeclarations: [
      {
        isDefaultExport: false,
        importModuleNameFrom: 'ISample',
        importModuleNameTo: 'ISample_Bj1QDZJTGuSJNVowtarJ1NMW6qOmdwBA',
        isPureType: true,
      },
    ],
  },
];
