import type IImportConfiguration from '#compilers/interfaces/IImportConfiguration';
import type IReason from '#compilers/interfaces/IReason';
import type { IHandlerStatement, IOptionStatement } from '#compilers/interfaces/THandlerNode';
import getPropertySignatures from '#compilers/navigate/getPropertySignatures';
import getLocalModuleInImports from '#compilers/tools/getLocalModuleInImport';
import getResolvedModuleInImports from '#compilers/tools/getResolvedModuleInImports';
import getTypeReferences from '#compilers/tools/getTypeReferences';
import getTypeSymbolText from '#compilers/tools/getTypeSymbolText';
import replaceTypeReferenceInTypeLiteral from '#compilers/tools/replaceTypeReferenceInTypeLiteral';
import validatePropertySignature from '#compilers/validators/validatePropertySignature';
import validateTypeReferences from '#compilers/validators/validateTypeReference';
import type IConfig from '#configs/interfaces/IConfig';
import dedupeImportConfiguration from '#generators/dedupeImportConfiguration';
import getHandlerNameWithoutSquareBracket from '#generators/getHandlerNameWithoutSquareBracket';
import getImportConfigurationFromResolutions from '#generators/getImportConfigurationFromResolutions';
import type IRouteConfiguration from '#routes/interface/IRouteConfiguration';
import type IRouteHandler from '#routes/interface/IRouteHandler';
import appendPostfixHash from '#tools/appendPostfixHash';
import logger from '#tools/logging/logger';
import { CE_REQUEST_HANDLER_ANALYSIS_MACHINE } from '#xstate/interfaces/CE_REQUEST_HANDLER_ANALYSIS_MACHINE';
import castFunctionNode from '#xstate/tools/castFunctionNode';
import chalk from 'chalk';
import * as path from 'path';
import type { Project, SourceFile, Type } from 'ts-morph';
import { assign, createMachine } from 'xstate';

const log = logger();

export interface IAnalysisMachineContext {
  project: Project;
  source: SourceFile;
  routeHandler: IRouteHandler;
  handler: IHandlerStatement;
  currentNode: number;
  config: IConfig;
  routeOption?: IOptionStatement;
  hash: string;

  useFastifyRequest: boolean;
  typeNode?: Type;
  messages: IReason[];
  importBox: Record<string, IImportConfiguration>;
  routeBox: Record<string, IRouteConfiguration>;
}

const requestHandlerAnalysisMachine = (
  rootContext: Omit<
    IAnalysisMachineContext,
    'currentNode' | 'messages' | 'typeNode' | 'importBox' | 'routeBox' | 'useFastifyRequest' | 'typeAliasNode'
  >,
) =>
  createMachine<IAnalysisMachineContext>(
    {
      // https://xstate.js.org/docs/guides/actions.html
      predictableActionArguments: true,
      id: 'request-analysis',
      initial: CE_REQUEST_HANDLER_ANALYSIS_MACHINE.INITIAL,
      context: { ...rootContext, currentNode: 0, messages: [], importBox: {}, routeBox: {}, useFastifyRequest: false },
      states: {
        [CE_REQUEST_HANDLER_ANALYSIS_MACHINE.INITIAL]: {
          entry: (context) => {
            log.debug(`xstate 상태 기계 시작: ${context.currentNode}`);
          },
          always: [
            {
              target: CE_REQUEST_HANDLER_ANALYSIS_MACHINE.ANY_TYPE,
              cond: 'isAsyncZeroParameter',
              actions: 'generateAnyTypeReference',
            },
            {
              target: CE_REQUEST_HANDLER_ANALYSIS_MACHINE.PREPARE_ANALYSIS,
              cond: 'isAsyncOneParameter',
            },
            {
              target: CE_REQUEST_HANDLER_ANALYSIS_MACHINE.PREPARE_ANALYSIS,
              cond: 'isAsyncManyParameter',
            },
            {
              target: CE_REQUEST_HANDLER_ANALYSIS_MACHINE.PREPARE_ANALYSIS,
              cond: 'isSyncManyParameter',
            },
            {
              target: CE_REQUEST_HANDLER_ANALYSIS_MACHINE.ERROR,
              actions: 'generateSyncNonParameterError',
              // TODO: error 로 가면서 오류를 저장한다 ,
            },
          ],
        },
        // ------------------------------------------------------------------------------------------------------------
        // 내부 상태 기계 시작
        // ------------------------------------------------------------------------------------------------------------
        [CE_REQUEST_HANDLER_ANALYSIS_MACHINE.PREPARE_ANALYSIS]: {
          always: [
            {
              target: CE_REQUEST_HANDLER_ANALYSIS_MACHINE.FASTIFY_REQUEST_TYPE,
              cond: 'isFastifyRequestType',
              actions: 'assignUseFastifyRequest',
            },
            {
              target: CE_REQUEST_HANDLER_ANALYSIS_MACHINE.PREPARE_CUSTOM_TYPE,
              cond: 'isParameterUseCustomType',
              actions: 'assignParameterType',
            },
            {
              target: CE_REQUEST_HANDLER_ANALYSIS_MACHINE.ANY_TYPE,
              actions: 'generateAnyTypeReference',
            },
          ],
        },
        [CE_REQUEST_HANDLER_ANALYSIS_MACHINE.FASTIFY_REQUEST_TYPE]: {
          always: [
            {
              target: CE_REQUEST_HANDLER_ANALYSIS_MACHINE.PREPARE_CUSTOM_TYPE,
              cond: 'isFastifyRequestWithTypeArgument',
              actions: 'assignFastifyTypeArgument',
            },
            {
              target: CE_REQUEST_HANDLER_ANALYSIS_MACHINE.ANY_TYPE,
              actions: 'generateAnyTypeReference',
            },
          ],
        },
        [CE_REQUEST_HANDLER_ANALYSIS_MACHINE.ANY_TYPE]: {
          always: [
            {
              target: CE_REQUEST_HANDLER_ANALYSIS_MACHINE.COMPLETE_ANALYSIS,
            },
          ],
        },
        [CE_REQUEST_HANDLER_ANALYSIS_MACHINE.PREPARE_CUSTOM_TYPE]: {
          always: [
            // 여기서는 type alias, custom type을 테스트 해보고 안되면 any type으로
            // 보내는 것이 좀 더 오류를 적게 유발하고 합리적이다
            {
              target: CE_REQUEST_HANDLER_ANALYSIS_MACHINE.CUSTOM_TYPE,
              cond: 'isCustomType',
            },
            {
              target: CE_REQUEST_HANDLER_ANALYSIS_MACHINE.ANY_TYPE,
              actions: 'generateAnyTypeReference',
            },
          ],
        },
        [CE_REQUEST_HANDLER_ANALYSIS_MACHINE.CUSTOM_TYPE]: {
          always: [
            {
              target: CE_REQUEST_HANDLER_ANALYSIS_MACHINE.VALIDATE_EXPORTATION,
              cond: 'isValidTypeReferences',
            },
            {
              target: CE_REQUEST_HANDLER_ANALYSIS_MACHINE.ERROR,
              actions: 'generateTypeReferenceNotExportReason',
            },
          ],
        },
        [CE_REQUEST_HANDLER_ANALYSIS_MACHINE.VALIDATE_EXPORTATION]: {
          always: [
            {
              target: CE_REQUEST_HANDLER_ANALYSIS_MACHINE.VALIDATE_PROPERTY_SIGNATURE,
              cond: 'isWarnPropertySignature',
              actions: ['generatePropertySignatureWarnReason', 'generateRouteAndImport'],
            },
            {
              target: CE_REQUEST_HANDLER_ANALYSIS_MACHINE.VALIDATE_PROPERTY_SIGNATURE,
              cond: 'isPropertySignature',
              actions: 'generateRouteAndImport',
            },
            {
              target: CE_REQUEST_HANDLER_ANALYSIS_MACHINE.ERROR,
              actions: 'generateTypeReferenceNotExportReason',
            },
          ],
        },
        [CE_REQUEST_HANDLER_ANALYSIS_MACHINE.VALIDATE_PROPERTY_SIGNATURE]: {
          always: [
            {
              target: CE_REQUEST_HANDLER_ANALYSIS_MACHINE.COMPLETE_ANALYSIS,
            },
            {
              target: CE_REQUEST_HANDLER_ANALYSIS_MACHINE.ANY_TYPE,
              actions: 'generateAnyTypeReference',
            },
          ],
        },
        [CE_REQUEST_HANDLER_ANALYSIS_MACHINE.COMPLETE_ANALYSIS]: {
          always: [
            {
              target: CE_REQUEST_HANDLER_ANALYSIS_MACHINE.COMPLETE,
            },
          ],
        },
        // ------------------------------------------------------------------------------------------------------------
        // 내부 상태 기계 끝
        // ------------------------------------------------------------------------------------------------------------
        [CE_REQUEST_HANDLER_ANALYSIS_MACHINE.ERROR]: {
          always: [
            {
              // node complete으로 가면서 오류를 context에 저장해야 한다
              target: CE_REQUEST_HANDLER_ANALYSIS_MACHINE.COMPLETE,
            },
          ],
        },
        [CE_REQUEST_HANDLER_ANALYSIS_MACHINE.COMPLETE]: {
          type: 'final',
          entry: () => {
            log.debug('분석이 끝?? -3');
          },
          data: (context): Pick<IAnalysisMachineContext, 'importBox' | 'routeBox' | 'messages'> => {
            return {
              importBox: context.importBox,
              routeBox: context.routeBox,
              messages: context.messages,
            };
          },
        },
      },
    },
    {
      // actions는 actions에서 사용된다
      actions: {
        assignUseFastifyRequest: assign((context) => {
          const next = { ...context };
          next.useFastifyRequest = true;

          return next;
        }),
        assignParameterType: assign((context) => {
          const next = { ...context };
          const currentNode = next.handler;
          const node = castFunctionNode(currentNode);
          const [parameter] = node.getParameters();

          // Req arguments를 전달해야 여기로 오기 때문에 parameter는 무조건 1개 이상이다
          if (parameter == null) {
            throw new Error('Invalid state in assignFastifyTypeArgument: empty parameter');
          }

          // parameter에서 type이 없는 경우 any와 동일하게 처리하면 된다,
          // 그리고 이 상황도 없다, type 없는 경우 이미 ANY_TYPE으로 보냈다
          const parameterTypeNode = parameter.getType();
          if (parameterTypeNode == null) {
            throw new Error('Invalid state in assignFastifyTypeArgument: empty parameter.type');
          }

          next.typeNode = parameterTypeNode;
          return next;
        }),
        assignFastifyTypeArgument: assign((context) => {
          const next = { ...context };
          const node = castFunctionNode(next.handler);
          const [parameter] = node.getParameters();

          // FastifyRequest를 사용해야 여기로 오기 때문에 parameters가 무조건 1개 이상이다
          if (parameter == null) {
            throw new Error('Invalid state in assignFastifyTypeArgument: empty parameter');
          }

          // parameter에서 type이 없는 경우 any와 동일하게 처리하면 된다,
          // 그리고 이 상황도 없다, type 없는 경우 이미 ANY_TYPE으로 보냈다
          const typeArguments = parameter.getType().getTypeArguments();

          // 이게 진짜 Any 타입이다, 하지만 이상황도 이미 이미 ANY_TYPE으로 보냈다
          if (typeArguments.length < 1) {
            throw new Error('Invalid state in assignFastifyTypeArgument: empty parameter.type');
          }

          const [typeArgument] = typeArguments ?? [];
          if (typeArgument == null) {
            throw new Error('Invalid state in assignFastifyTypeArgument: empty parameter.type.typeArguments');
          }

          next.typeNode = typeArgument;
          return next;
        }),
        generateAnyTypeReference: assign((context) => {
          const next = { ...context };
          const sourceFilePath = context.source.getFilePath().toString();

          // TODO: 관련 코드에 [filenamify](https://github.com/sindresorhus/filenamify)와
          // [valid-filename](https://github.com/sindresorhus/valid-filename)를
          // 적용하고, valid 아닌 경우 IReason으로 경고도 출력한다

          // apply filenamify, valid-filename after display IReason by warn
          const routeFileImportConfiguration: IImportConfiguration = {
            hash: next.hash,
            namedBindings:
              next.routeOption != null
                ? [
                    {
                      name: 'option',
                      alias: `${appendPostfixHash('option', next.hash)}`,
                      isPureType: false,
                    },
                  ]
                : [],
            nonNamedBinding:
              next.handler.name === 'anonymous function'
                ? appendPostfixHash(
                    getHandlerNameWithoutSquareBracket(path.basename(next.source.getFilePath().toString(), '.ts')),
                    next.hash,
                  )
                : appendPostfixHash(getHandlerNameWithoutSquareBracket(next.handler.name), next.hash),
            importFile: next.source.getFilePath().toString(),
            // source: next.source,
          };

          const nextImportBox = { ...next.importBox, [sourceFilePath]: routeFileImportConfiguration };

          const routeConfiguration: IRouteConfiguration = {
            hash: next.hash,
            hasOption: next.routeOption != null,
            method: next.routeHandler.method,
            routePath: next.routeHandler.routePath,
            handlerName:
              next.handler.name === 'anonymous function'
                ? appendPostfixHash(
                    getHandlerNameWithoutSquareBracket(path.basename(next.source.getFilePath().toString(), '.ts')),
                    next.hash,
                  )
                : appendPostfixHash(getHandlerNameWithoutSquareBracket(next.handler.name), next.hash),

            sourceFilePath,
            // source: context.source,
          };

          const nextRouteBox = { ...next.routeBox, [sourceFilePath]: routeConfiguration };

          return { ...next, importBox: nextImportBox, routeBox: nextRouteBox };
        }),
        generateSyncNonParameterError: assign((context) => {
          const next = { ...context };

          const startPos = next.handler.node.getStart(false);
          const lineAndCharacter = context.source.getLineAndColumnAtPos(startPos);

          const message: IReason = {
            type: 'error',
            filePath: context.source.getFilePath().toString(),
            source: context.source,
            node: next.handler.node,
            lineAndCharacter: { line: lineAndCharacter.line, character: lineAndCharacter.column },
            message: 'synchronous route handler have to do send response data using reply.send function',
          };

          next.messages.push(message);

          return next;
        }),
        generateTypeReferenceNotExportReason: assign((context) => {
          const next = { ...context };
          const { source } = context;

          const node = castFunctionNode(context.handler);
          const [parameter] = node.getParameters();

          if (parameter == null) return next;

          const typeReferenceNodes = getTypeReferences(parameter);
          const result = validateTypeReferences({ source, typeReferenceNodes });

          const notExportClassReasons = result.classes.total
            .filter((classNode) => {
              return (
                result.classes.exported
                  .map((exportedClassNode) => exportedClassNode.getText())
                  .includes(classNode.getText()) === false
              );
            })
            .map((nonExportNode) => {
              const startPos = nonExportNode.getStart(false);
              const lineAndCharacter = context.source.getLineAndColumnAtPos(startPos);

              const reason: IReason = {
                type: 'error',
                filePath: context.source.getFilePath().toString(),
                source: context.source,
                node: next.handler.node,
                lineAndCharacter: { line: lineAndCharacter.line, character: lineAndCharacter.column },
                message: `not export class: ${
                  nonExportNode.getType().getSymbol()?.getEscapedName() ?? node.getType().getText()
                }`,
              };

              return reason;
            });

          const notExportInterfaceReasons = result.interfaces.total
            .filter((interfaceNode) => {
              return (
                result.interfaces.exported
                  .map((exportedClassNode) => exportedClassNode.getText())
                  .includes(interfaceNode.getText()) === false
              );
            })
            .map((nonExportNode) => {
              const startPos = nonExportNode.getStart(false);
              const lineAndCharacter = context.source.getLineAndColumnAtPos(startPos);

              const reason: IReason = {
                type: 'error',
                filePath: context.source.getFilePath().toString(),
                source: context.source,
                node: next.handler.node,
                lineAndCharacter: { line: lineAndCharacter.line, character: lineAndCharacter.column },
                message: `not export interface: ${
                  nonExportNode.getType().getSymbol()?.getEscapedName() ?? node.getType().getText()
                }`,
              };

              return reason;
            });

          const notExportTypeAliasReasons = result.typeAliases.total
            .filter((typeAliasNode) => {
              return (
                result.typeAliases.exported
                  .map((exportedClassNode) => exportedClassNode.getText())
                  .includes(typeAliasNode.getText()) === false
              );
            })
            .map((nonExportNode) => {
              const startPos = nonExportNode.getStart(false);
              const lineAndCharacter = context.source.getLineAndColumnAtPos(startPos);

              const reason: IReason = {
                type: 'error',
                filePath: context.source.getFilePath().toString(),
                source: context.source,
                node: next.handler.node,
                lineAndCharacter: { line: lineAndCharacter.line, character: lineAndCharacter.column },
                message: `not export type alias: ${
                  nonExportNode.getType().getSymbol()?.getEscapedName() ?? node.getType().getText()
                }`,
              };

              return reason;
            });

          next.messages.push(
            ...notExportClassReasons.concat(notExportInterfaceReasons).concat(notExportTypeAliasReasons),
          );

          return next;
        }),
        generatePropertySignatureWarnReason: assign((context) => {
          const next = { ...context };
          const node = castFunctionNode(context.handler);
          const [parameter] = node.getParameters();

          if (parameter == null) return next;

          const propertySignatures = getPropertySignatures({ parameter });
          const result = validatePropertySignature({
            propertySignatures,
            type: context.useFastifyRequest ? 'FastifyRequest' : 'ObjectType',
          });

          const propertySignatureWarns = result.fuzzy.map((fuzzyWarn) => {
            const startPos = node.getStart(false);
            const lineAndCharacter = context.source.getLineAndColumnAtPos(startPos);

            const reason: IReason = {
              type: 'warn',
              filePath: context.source.getFilePath().toString(),
              source: context.source,
              node: next.handler.node,
              lineAndCharacter: { line: lineAndCharacter.line, character: lineAndCharacter.column },
              message: `Do you want ${fuzzyWarn.expectName}? "${chalk.yellow(fuzzyWarn.target)}" in source code`,
            };

            return reason;
          });

          next.messages.push(...propertySignatureWarns);

          return next;
        }),
        generateRouteAndImport: assign((context) => {
          const next = { ...context };
          const node = castFunctionNode(context.handler);
          const sourceFilePath = next.source.getFilePath().toString();
          const [parameter] = node.getParameters();

          if (parameter == null) return next;

          const [typeArgument] = context.useFastifyRequest
            ? parameter.getType().getTypeArguments()
            : [parameter.getType()];

          if (typeArgument == null) return next;

          const routeFileImportConfiguration: IImportConfiguration = {
            hash: next.hash,
            namedBindings:
              next.routeOption != null
                ? [
                    {
                      name: 'option',
                      alias: `${appendPostfixHash('option', next.hash)}`,
                      isPureType: false,
                    },
                  ]
                : [],
            nonNamedBinding:
              next.handler.name === 'anonymous function'
                ? appendPostfixHash(
                    getHandlerNameWithoutSquareBracket(path.basename(next.source.getFilePath().toString(), '.ts')),
                    next.hash,
                  )
                : appendPostfixHash(getHandlerNameWithoutSquareBracket(next.handler.name), next.hash),
            importFile: next.source.getFilePath().toString(),
            // source: next.source,
          };

          const routeConfiguration: IRouteConfiguration = {
            hash: next.hash,
            hasOption: next.routeOption != null,
            method: next.routeHandler.method,
            routePath: next.routeHandler.routePath,
            handlerName:
              next.handler.name === 'anonymous function'
                ? appendPostfixHash(
                    getHandlerNameWithoutSquareBracket(path.basename(next.source.getFilePath().toString(), '.ts')),
                    next.hash,
                  )
                : appendPostfixHash(getHandlerNameWithoutSquareBracket(next.handler.name), next.hash),

            sourceFilePath,
            // source: context.source,
          };

          // TypeReference에 대한 처리를 해준다
          const typeReferenceNodes = getTypeReferences(parameter);
          const everyTypeReferenceNodes = getTypeReferences(parameter, false);
          const resolutions = getResolvedModuleInImports({
            source: context.source,
            option: context.config,
            typeReferenceNodes,
          });

          const localResolutions = getLocalModuleInImports({
            source: context.source,
            option: context.config,
            typeReferenceNodes,
          });

          replaceTypeReferenceInTypeLiteral({
            resolutions: [...resolutions, ...localResolutions],
            typeReferenceNodes: everyTypeReferenceNodes,
          });

          routeConfiguration.typeArgument = context.useFastifyRequest
            ? (() => {
                if (typeArgument.isObject()) {
                  const [newTypeArgument] = context.useFastifyRequest
                    ? parameter.getType().getTypeArguments()
                    : [parameter.getType()];

                  if (newTypeArgument == null) return undefined;

                  // https://github.com/dsherret/ts-morph/issues/202
                  // symbol을 호출하고 declaration을 호출해서 declaration에서 text를 얻어낸다

                  const text = getTypeSymbolText(newTypeArgument);
                  return text;
                }

                return typeArgument.getSymbolOrThrow().getEscapedName();
              })()
            : parameter.getTypeNodeOrThrow().getFullText().trim();

          const localDeclarations = getImportConfigurationFromResolutions({
            // source: next.source,
            resolutions: localResolutions,
          });

          const localImportConfigurations = dedupeImportConfiguration([
            routeFileImportConfiguration,
            ...localDeclarations,
          ]);

          const externalDeclarations = getImportConfigurationFromResolutions({
            // source: next.source,
            resolutions,
          });

          const importConfigurations = dedupeImportConfiguration([
            ...localImportConfigurations,
            ...externalDeclarations,
          ]);

          const record = importConfigurations.reduce<Record<string, IImportConfiguration>>(
            (aggregation, importConfiguration) => {
              if (aggregation[importConfiguration.importFile] == null) {
                return { ...aggregation, [importConfiguration.importFile]: importConfiguration };
              }

              return aggregation;
            },
            {},
          );

          const nextRouteBox = { ...next.routeBox, [sourceFilePath]: routeConfiguration };

          return { ...next, importBox: record, routeBox: nextRouteBox };
        }),
      },

      // guards는 cond에서 사용된다
      guards: {
        isAsyncZeroParameter: (context) => {
          const currentNode = context.handler;
          const node = castFunctionNode(currentNode);
          return node.getParameters().length <= 0 && currentNode.type === 'async';
        },
        isAsyncOneParameter: (context) => {
          const currentNode = context.handler;
          const node = castFunctionNode(currentNode);
          return node.getParameters().length <= 1 && currentNode.type === 'async';
        },
        isAsyncManyParameter: (context) => {
          const currentNode = context.handler;
          const node = castFunctionNode(currentNode);
          return node.getParameters().length > 1 && currentNode.type === 'async';
        },
        isSyncManyParameter: (context) => {
          const currentNode = context.handler;
          const node = castFunctionNode(currentNode);
          return node.getParameters().length > 1 && currentNode.type === 'sync';
        },
        isFastifyRequestType: (context) => {
          const currentNode = context.handler;
          const node = castFunctionNode(currentNode);
          const [parameter] = node.getParameters();
          const typeName = parameter.getType().getSymbol()?.getEscapedName();
          return typeName === 'FastifyRequest';
        },
        isParameterUseCustomType: (context) => {
          const currentNode = context.handler;
          const node = castFunctionNode(currentNode);
          const [parameter] = node.getParameters();

          const typeName = parameter.getType().getSymbol()?.getEscapedName();
          return typeName !== 'FastifyRequest';
        },
        isFastifyRequestWithTypeArgument: (context) => {
          const node = castFunctionNode(context.handler);
          const [parameter] = node.getParameters();
          const typeArguments = parameter.getType().getTypeArguments();

          if (typeArguments.length < 1) {
            return false;
          }

          const [typeArgument] = typeArguments;

          const typeName = typeArgument.getSymbol()?.getName();
          const isFastifyTypeName =
            typeName === 'RequestGenericInterface' ||
            typeName === 'RouteGenericInterface' ||
            typeName === 'RawServer' ||
            typeName === 'RawRequest' ||
            typeName === 'SchemaCompiler' ||
            typeName === 'TypeProvider' ||
            typeName === 'ContextConfig' ||
            typeName === 'RequestType' ||
            typeName === 'Logger';

          if (
            isFastifyTypeName === false &&
            (typeArgument.isObject() ||
              typeArgument.isClassOrInterface() ||
              typeArgument.isLiteral() ||
              typeArgument.isUnionOrIntersection())
          ) {
            return true;
          }

          return false;
        },
        isCustomType: (context) => {
          // parameter에서 type이 없다면 any와 동일하게 처리하면 된다
          const { typeNode } = context;

          if (typeNode == null) {
            return false;
          }

          const typeName = typeNode.getSymbol()?.getName();
          const isFastifyTypeName =
            typeName === 'RequestGenericInterface' ||
            typeName === 'RouteGenericInterface' ||
            typeName === 'RawServer' ||
            typeName === 'RawRequest' ||
            typeName === 'SchemaCompiler' ||
            typeName === 'TypeProvider' ||
            typeName === 'ContextConfig' ||
            typeName === 'RequestType' ||
            typeName === 'Logger';

          if (
            isFastifyTypeName === false &&
            (typeNode.isObject() ||
              typeNode.isClassOrInterface() ||
              typeNode.isLiteral() ||
              typeNode.isUnionOrIntersection())
          ) {
            return true;
          }

          return false;
        },
        isValidTypeReferences: (context) => {
          const { source } = context;

          const node = castFunctionNode(context.handler);
          const [parameter] = node.getParameters();

          const typeReferenceNodes = getTypeReferences(parameter);
          const result = validateTypeReferences({ source, typeReferenceNodes });

          return result.valid;
        },
        isWarnPropertySignature: (context) => {
          const node = castFunctionNode(context.handler);
          const [parameter] = node.getParameters();

          const propertySignatures = getPropertySignatures({ parameter });
          const result = validatePropertySignature({
            propertySignatures,
            type: context.useFastifyRequest ? 'FastifyRequest' : 'ObjectType',
          });

          return result.fuzzyValid && result.fuzzy.length > 0;
        },
        isPropertySignature: (context) => {
          const node = castFunctionNode(context.handler);
          const [parameter] = node.getParameters();

          const propertySignatures = getPropertySignatures({ parameter });
          const result = validatePropertySignature({
            propertySignatures,
            type: context.useFastifyRequest ? 'FastifyRequest' : 'ObjectType',
          });

          return result.valid;
        },
      },
    },
  );

export default requestHandlerAnalysisMachine;
