import { IHandlerStatement } from '@compiler/interface/THandlerNode';
import getHandlerWithOption from '@compiler/navigate/getHandlerWithOption';
import getInternalImportTypeReference from '@compiler/tool/getInternalImportTypeReference';
import getResolvedModuleInImports from '@compiler/tool/getResolvedModuleInImports';
import getTypeReferences from '@compiler/tool/getTypeReferences';
import replaceTypeReferenceInTypeLiteral from '@compiler/tool/replaceTypeReferenceInTypeLiteral';
import { IOption } from '@module/IOption';
import * as env from '@testenv/env';
import getProcessedConfig from '@tool/getProcessedConfig';
import consola, { LogLevel } from 'consola';
import 'jest';
import { isEmpty } from 'my-easy-fp';
import { replaceSepToPosix } from 'my-node-fp';
import { isFail } from 'my-only-either';
import path from 'path';
import * as tsm from 'ts-morph';

const share: { projectPath: string; project: tsm.Project; option: IOption } = {} as any;

describe('navigate', () => {
  beforeAll(async () => {
    share.projectPath = path.join(env.examplePath, 'tsconfig.json');

    const optionEither = await getProcessedConfig({
      args: {
        _: [],
        $0: 'route',
        project: share.projectPath,
        v: false,
        verbose: false,
        d: false,
        debugLog: false,
        p: share.projectPath,
        h: env.handlerPath,
        handler: env.handlerPath,
        o: env.handlerPath,
        output: env.handlerPath,
      },
      project: share.projectPath,
    });

    if (isFail(optionEither)) {
      throw optionEither.fail;
    }

    consola.level = LogLevel.Debug;
    share.project = new tsm.Project({ tsConfigFilePath: share.projectPath });
    share.option = optionEither.pass;
  });

  test('generateRouteFunctionCode', async () => {
    // project://example/handlers/get/justice/world.ts
    const routeFilePath = replaceSepToPosix(path.join(env.handlerPath, 'get\\justice\\world.ts'));
    const source = share.project.getSourceFileOrThrow(routeFilePath);
    const handlerWithOption = getHandlerWithOption(source);
    const handler = handlerWithOption.find((node) => node.kind === 'handler');

    if (isEmpty(handler)) {
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
    const internalTypeReferenceNodes = getInternalImportTypeReference({ source, typeReferenceNodes });
    const resolutions = getResolvedModuleInImports({
      source,
      typeReferenceNodes: internalTypeReferenceNodes,
      option: share.option,
    });

    replaceTypeReferenceInTypeLiteral({ resolutions, typeReferenceNodes: fullTypeReferenceNodes });

    // 아래 코드를 사용해서 TypeReference에서 사용하는 default export 이름을 바꿀 수 있다. hash 적용된 것으로 바꿔야한다
    // 그리고 getTypeReferences에서 dedupe하기 전 목록을 가져와서 모두 바꿔야 한다

    const replacedTypeLiteral = parameter.getTypeNode()?.getFullText();
    const typeName = parameter.getType().getSymbolOrThrow().getEscapedName();
    const typeContent = parameter.getType().getTypeArguments()[0].getText();

    consola.debug('1: ', typeName);
    consola.debug('2: ', typeContent);
    consola.debug('3: ', replacedTypeLiteral);
  });
});
