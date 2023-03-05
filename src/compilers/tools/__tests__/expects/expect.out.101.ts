import posixJoin from '#tools/posixJoin';
import * as env from '#tools/__tests__/tools/env';

export default [
  {
    isExternalLibraryImport: false,
    importAt: posixJoin(env.handlerPath, 'get', 'xman', 'ww.ts'),
    exportFrom: posixJoin(env.examplePath, 'interface', 'ITestInfo.ts'),
    hash: 'JsGOaL6wbH59ipqgaJOz0HYpJCEgTz9t',
    importDeclarations: [
      {
        isDefaultExport: false,
        importModuleNameTo: 'ITestInfoType01',
        importModuleNameFrom: 'ITestInfoType01',
        isPureType: true,
      },
      {
        isDefaultExport: false,
        importModuleNameTo: 'ITestInfoType02',
        importModuleNameFrom: 'ITestInfoType02',
        isPureType: true,
      },
    ],
  },
  {
    isExternalLibraryImport: false,
    hash: 'SynyPSafLHaoobLmnZXzP70l78QG5PfE',
    importAt: posixJoin(env.handlerPath, 'get', 'xman', 'ww.ts'),
    exportFrom: posixJoin(env.handlerPath, 'get', 'interface', 'IReqPokeHello.ts'),
    importDeclarations: [
      {
        isDefaultExport: true,
        importModuleNameFrom: 'IReqPokeHello',
        importModuleNameTo: 'IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE',
        isPureType: true,
      },
    ],
  },
  {
    isExternalLibraryImport: false,
    hash: 'DS8Pg2MYm5AsqoJVltiuqlOctGQfT78w',
    importAt: posixJoin(env.handlerPath, 'get', 'xman', 'ww.ts'),
    exportFrom: posixJoin(env.examplePath, 'interface', 'TAbnormalPresident.ts'),
    importDeclarations: [
      {
        isDefaultExport: true,
        importModuleNameFrom: 'TAbnormalPreent',
        importModuleNameTo: 'TAbnormalPresident_DS8Pg2MYm5AsqoJVltiuqlOctGQfT78w',
        isPureType: true,
      },
    ],
  },
  {
    isExternalLibraryImport: false,
    hash: '6bwarMss36QHeqUXTVMxB9uAjEjVZOL1',
    importAt: posixJoin(env.handlerPath, 'get', 'xman', 'ww.ts'),
    exportFrom: posixJoin(env.examplePath, 'interface', 'ICompany.ts'),
    importDeclarations: [
      {
        isDefaultExport: true,
        importModuleNameFrom: 'ICompany',
        importModuleNameTo: 'ICompany_6bwarMss36QHeqUXTVMxB9uAjEjVZOL1',
        isPureType: true,
      },
    ],
  },
  {
    isExternalLibraryImport: false,
    importAt: posixJoin(env.handlerPath, 'get', 'xman', 'ww.ts'),
    exportFrom: posixJoin(env.examplePath, 'interface', 'IAbility.ts'),
    hash: 'FaJPXXq2KiAC6EVDBL3aeh4ER262pWhl',
    importDeclarations: [
      {
        isDefaultExport: false,
        importModuleNameTo: 'IAbility',
        importModuleNameFrom: 'IAbility',
        isPureType: true,
      },
    ],
  },
];
