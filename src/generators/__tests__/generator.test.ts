import getHandlerWithOption from '#compilers/navigate/getHandlerWithOption';
import getInternalImportTypeReference from '#compilers/tools/getInternalImportTypeReference';
import getResolvedModuleInImports from '#compilers/tools/getResolvedModuleInImports';
import getTypeReferences from '#compilers/tools/getTypeReferences';
import replaceTypeReferenceInTypeLiteral from '#compilers/tools/replaceTypeReferenceInTypeLiteral';
import * as env from '#tools/__tests__/tools/env';
import logger from '#tools/logger';
import 'jest';
import { atOrThrow } from 'my-easy-fp';
import { replaceSepToPosix } from 'my-node-fp';
import path from 'path';
import * as tsm from 'ts-morph';

const share: { projectPath: string; project: tsm.Project } = {} as any;
const log = logger();

beforeAll(async () => {
  share.projectPath = path.join(env.examplePath, 'tsconfig.json');
  share.project = new tsm.Project({ tsConfigFilePath: share.projectPath });
});

describe('navigate', () => {
  test('generateRouteFunctionCode', async () => {
    // project://example/handlers/get/justice/world.ts
    const routeFilePath = replaceSepToPosix(path.join(env.handlerPath, 'get\\justice\\world.ts'));
    const source = share.project.getSourceFileOrThrow(routeFilePath);
    const routing = getHandlerWithOption(source);
    const handler = routing.handler!;

    const casted =
      handler.node.getKind() === tsm.SyntaxKind.FunctionDeclaration
        ? handler.node.asKindOrThrow(tsm.SyntaxKind.FunctionDeclaration)
        : handler.node.asKindOrThrow(tsm.SyntaxKind.ArrowFunction);

    const parameters = casted.getParameters();
    const parameter = atOrThrow(parameters, 0);

    // 결국 resolve module을 하는 이유가, parameter 또는 typeArgument를 위해서인데
    // state-machine을 좀 더 단순화 하려면 resolvemoulde이, parameter 또는 typeArgument를
    // 알아내서 resolved module을 가져 오는게 좋을 듯 하다
    const typeReferenceNodes = getTypeReferences(parameter);
    const fullTypeReferenceNodes = getTypeReferences(parameter, false);
    const internalTypeReferenceNodes = getInternalImportTypeReference({ source, typeReferenceNodes });
    const resolutions = getResolvedModuleInImports({
      source,
      typeReferenceNodes: internalTypeReferenceNodes,
      option: env.option,
    });

    replaceTypeReferenceInTypeLiteral({ resolutions, typeReferenceNodes: fullTypeReferenceNodes });

    // 아래 코드를 사용해서 TypeReference에서 사용하는 default export 이름을 바꿀 수 있다. hash 적용된 것으로 바꿔야한다
    // 그리고 getTypeReferences에서 dedupe하기 전 목록을 가져와서 모두 바꿔야 한다

    const replacedTypeLiteral = parameter.getTypeNode()?.getFullText();
    const typeName = parameter.getType().getSymbolOrThrow().getEscapedName();
    const typeContent = atOrThrow(parameter.getType().getTypeArguments(), 0).getText();

    log.debug('1: ', typeName);
    log.debug('2: ', typeContent);
    log.debug('3: ', replacedTypeLiteral);
  });
});
