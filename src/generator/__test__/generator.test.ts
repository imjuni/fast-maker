import { IHandlerStatement } from '@compiler/interface/THandlerNode';
import getHandlerWithOption from '@compiler/navigate/getHandlerWithOption';
import getInternalImportTypeReference from '@compiler/tool/getInternalImportTypeReference';
import getResolvedModuleInImports from '@compiler/tool/getResolvedModuleInImports';
import getTypeReferences from '@compiler/tool/getTypeReferences';
import replaceTypeReferenceInTypeLiteral from '@compiler/tool/replaceTypeReferenceInTypeLiteral';
import IConfig from '@config/interface/IConfig';
import * as env from '@testenv/env';
import consola, { LogLevel } from 'consola';
import 'jest';
import { isEmpty } from 'my-easy-fp';
import { replaceSepToPosix } from 'my-node-fp';
import path from 'path';
import * as tsm from 'ts-morph';

const share: { projectPath: string; project: tsm.Project; option: IConfig } = {} as any;

describe('navigate', () => {
  beforeAll(async () => {
    share.projectPath = path.join(env.examplePath, 'tsconfig.json');

    consola.level = LogLevel.Debug;
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
    };
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

    // ?????? resolve module??? ?????? ?????????, parameter ?????? typeArgument??? ???????????????
    // state-machine??? ??? ??? ????????? ????????? resolvemoulde???, parameter ?????? typeArgument???
    // ???????????? resolved module??? ?????? ????????? ?????? ??? ??????
    const typeReferenceNodes = getTypeReferences(parameter);
    const fullTypeReferenceNodes = getTypeReferences(parameter, false);
    const internalTypeReferenceNodes = getInternalImportTypeReference({ source, typeReferenceNodes });
    const resolutions = getResolvedModuleInImports({
      source,
      typeReferenceNodes: internalTypeReferenceNodes,
      option: share.option,
    });

    replaceTypeReferenceInTypeLiteral({ resolutions, typeReferenceNodes: fullTypeReferenceNodes });

    // ?????? ????????? ???????????? TypeReference?????? ???????????? default export ????????? ?????? ??? ??????. hash ????????? ????????? ???????????????
    // ????????? getTypeReferences?????? dedupe?????? ??? ????????? ???????????? ?????? ????????? ??????

    const replacedTypeLiteral = parameter.getTypeNode()?.getFullText();
    const typeName = parameter.getType().getSymbolOrThrow().getEscapedName();
    const typeContent = parameter.getType().getTypeArguments()[0].getText();

    consola.debug('1: ', typeName);
    consola.debug('2: ', typeContent);
    consola.debug('3: ', replacedTypeLiteral);
  });
});
