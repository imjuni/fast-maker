import type { IHandlerStatement } from '#compilers/interfaces/THandlerNode';
import getHandlerWithOption from '#compilers/navigate/getHandlerWithOption';
import getInternalImportTypeReference from '#compilers/tools/getInternalImportTypeReference';
import getResolvedModuleInImports from '#compilers/tools/getResolvedModuleInImports';
import getTypeReferences from '#compilers/tools/getTypeReferences';
import replaceTypeReferenceInTypeLiteral from '#compilers/tools/replaceTypeReferenceInTypeLiteral';
import type IConfig from '#configs/interfaces/IConfig';
import logger from '#tools/logging/logger';
import posixJoin from '#tools/posixJoin';
import * as env from '#tools/__tests__/env';
import 'jest';
import { replaceSepToPosix } from 'my-node-fp';
import path from 'path';
import * as tsm from 'ts-morph';

const share: { projectPath: string; project: tsm.Project; option: IConfig } = {} as any;
const log = logger();

beforeAll(async () => {
  share.projectPath = path.join(env.examplePath, 'tsconfig.json');

  share.project = new tsm.Project({ tsConfigFilePath: share.projectPath });
  share.option = {
    project: share.projectPath,
    v: false,
    verbose: false,
    debugLog: false,
    p: share.projectPath,
    h: env.handlerPath,
    handler: env.handlerPath,
    o: env.handlerPath,
    output: env.handlerPath,
    useDefaultExport: true,
    routeFunctionName: 'routing',
  };
});

test('getResolvedModuleInImports', async () => {
  const routeFilePath = replaceSepToPosix(path.join(env.handlerPath, 'get\\xman\\world.ts'));
  const source = share.project.getSourceFileOrThrow(routeFilePath);
  const handlerWithOption = getHandlerWithOption(source);
  const handler = handlerWithOption.find((node) => node.kind === 'handler');

  if (handler == null) {
    throw new Error('invalid handler');
  }

  const functionNode = handler as IHandlerStatement;

  const casted =
    functionNode.node.getKind() === tsm.SyntaxKind.FunctionDeclaration
      ? functionNode.node.asKindOrThrow(tsm.SyntaxKind.FunctionDeclaration)
      : functionNode.node.asKindOrThrow(tsm.SyntaxKind.ArrowFunction);

  const parameters = casted.getParameters();
  const [parameter] = parameters;

  // 결국 resolve module을 하는 이유가, parameter 또는 typeArgument를 위해서인데
  // state-machine을 좀 더 단순화 하려면 resolvemoulde이, parameter 또는 typeArgument를
  // 알아내서 resolved module을 가져 오는게 좋을 듯 하다
  const typeReferenceNodes = getTypeReferences(parameter);
  const internalTypeReferenceNodes = getInternalImportTypeReference({ source, typeReferenceNodes });
  const resolutions = getResolvedModuleInImports({
    source,
    typeReferenceNodes: internalTypeReferenceNodes,
    option: share.option,
  });

  log.debug(JSON.stringify(resolutions, null, 2));

  expect(resolutions).toEqual([
    {
      isExternalLibraryImport: false,
      hash: 'SynyPSafLHaoobLmnZXzP70l78QG5PfE',
      importAt: posixJoin(env.examplePath, 'handlers', 'get', 'xman', 'world.ts'),
      exportFrom: posixJoin(env.examplePath, 'handlers', 'get', 'interface', 'IReqPokeHello.ts'),
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
      importAt: posixJoin(env.examplePath, 'handlers', 'get', 'xman', 'world.ts'),
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
      importAt: posixJoin(env.examplePath, 'handlers', 'get', 'xman', 'world.ts'),
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
      importAt: posixJoin(env.examplePath, 'handlers', 'get', 'xman', 'world.ts'),
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
  ]);
});

test('replaceTypeReferenceInTypeLiteral', async () => {
  const routeFilePath = posixJoin(env.handlerPath, 'get', 'xman', 'world.ts');
  const source = share.project.getSourceFileOrThrow(routeFilePath);
  const handlerWithOption = getHandlerWithOption(source);
  const handler = handlerWithOption.find((node) => node.kind === 'handler');

  if (handler == null) {
    throw new Error('invalid handler');
  }

  const functionNode = handler as IHandlerStatement;

  const casted =
    functionNode.node.getKind() === tsm.SyntaxKind.FunctionDeclaration
      ? functionNode.node.asKindOrThrow(tsm.SyntaxKind.FunctionDeclaration)
      : functionNode.node.asKindOrThrow(tsm.SyntaxKind.ArrowFunction);

  const parameters = casted.getParameters();
  const [parameter] = parameters;

  // 결국 resolve module을 하는 이유가, parameter 또는 typeArgument를 위해서인데
  // state-machine을 좀 더 단순화 하려면 resolvemoulde이, parameter 또는 typeArgument를
  // 알아내서 resolved module을 가져 오는게 좋을 듯 하다
  const typeReferenceNodes = getTypeReferences(parameter);
  const fullTypeReferenceNodes = getTypeReferences(parameter, false);
  const resolutions = getResolvedModuleInImports({ source, typeReferenceNodes, option: share.option });

  replaceTypeReferenceInTypeLiteral({ resolutions, typeReferenceNodes: fullTypeReferenceNodes });

  // 아래 코드를 사용해서 TypeReference에서 사용하는 default export 이름을 바꿀 수 있다. hash 적용된 것으로 바꿔야한다
  // 그리고 getTypeReferences에서 dedupe하기 전 목록을 가져와서 모두 바꿔야 한다

  const replacedTypeLiteral = parameter.getTypeNode()?.getFullText();
  const expectation = `
  {
    querystring: IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE['querystring'];
    Body:
      | IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE['Body']
      | {
          help: TAbnormalPresident_DS8Pg2MYm5AsqoJVltiuqlOctGQfT78w;
          company: ICompany_6bwarMss36QHeqUXTVMxB9uAjEjVZOL1;
          ability: IAbility;
        };
    Headers: {
      'access-token': string;
      'refresh-token': string;
      kind: { name: 'develop' } & { name: 'prod' } & { name: ICompany_6bwarMss36QHeqUXTVMxB9uAjEjVZOL1 };
      'expire-time': {
        token: string | number | boolean;
        expire: number;
        site: {
          host: string;
          port: number;
        };
      };
    };
  }`;

  expect(replacedTypeLiteral?.trim()).toBe(expectation.trim());
});

test('filterExternalTypeReference', async () => {
  // project://example/handlers/get/justice/world.ts
  const routeFilePath = replaceSepToPosix(path.join(env.handlerPath, 'get\\justice\\world.ts'));
  const source = share.project.getSourceFileOrThrow(routeFilePath);
  const handlerWithOption = getHandlerWithOption(source);
  const handler = handlerWithOption.find((node) => node.kind === 'handler');

  if (handler == null) {
    throw new Error('invalid handler');
  }

  const functionNode = handler as IHandlerStatement;

  const casted =
    functionNode.node.getKind() === tsm.SyntaxKind.FunctionDeclaration
      ? functionNode.node.asKindOrThrow(tsm.SyntaxKind.FunctionDeclaration)
      : functionNode.node.asKindOrThrow(tsm.SyntaxKind.ArrowFunction);

  const parameters = casted.getParameters();
  const [parameter] = parameters;

  const typeReferenceNodes = getTypeReferences(parameter);
  const internalTypeReferenceNodes = getInternalImportTypeReference({ source, typeReferenceNodes });
  const typeNames = internalTypeReferenceNodes.map((node) => node.getTypeName().getText());

  expect(typeNames).toEqual(['IReqPokeHello']);
});
