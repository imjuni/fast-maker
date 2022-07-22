import IImportConfiguration from '@compiler/interface/IImportConfiguration';
import IReason from '@compiler/interface/IReason';
import { IHandlerStatement, IOptionStatement } from '@compiler/interface/THandlerNode';
import getPropertySignatures from '@compiler/navigate/getPropertySignatures';
import getLocalModuleInImports from '@compiler/tool/getLocalModuleInImport';
import getResolvedModuleInImports from '@compiler/tool/getResolvedModuleInImports';
import getTypeReferences from '@compiler/tool/getTypeReferences';
import getTypeSymbolText from '@compiler/tool/getTypeSymbolText';
import replaceTypeReferenceInTypeLiteral from '@compiler/tool/replaceTypeReferenceInTypeLiteral';
import validatePropertySignature from '@compiler/validation/validatePropertySignature';
import validateTypeReferences from '@compiler/validation/validateTypeReference';
import IConfig from '@config/interface/IConfig';
import dedupeImportConfiguration from '@generator/dedupeImportConfiguration';
import getHandlerNameWithoutSquareBracket from '@generator/getHandlerNameWithoutSquareBracket';
import getImportConfigurationFromResolutions from '@generator/getImportConfigurationFromResolutions';
import IRouteConfiguration from '@route/interface/IRouteConfiguration';
import IRouteHandler from '@route/interface/IRouteHandler';
import appendPostfixHash from '@tool/appendPostfixHash';
import castFunctionNode from '@xstate/tool/castFunctionNode';
import chalk from 'chalk';
import consola from 'consola';
import { isEmpty, isFalse, isNotEmpty } from 'my-easy-fp';
import * as path from 'path';
import * as tsm from 'ts-morph';
import { assign, createMachine } from 'xstate';

export interface IContextRequestHandlerAnalysisMachine {
  project: tsm.Project;
  source: tsm.SourceFile;
  routeHandler: IRouteHandler;
  handler: IHandlerStatement;
  currentNode: number;
  option: IConfig;
  routeOption?: IOptionStatement;
  hash: string;

  useFastifyRequest: boolean;
  typeNode?: tsm.Type;
  messages: IReason[];
  importBox: Record<string, IImportConfiguration>;
  routeBox: Record<string, IRouteConfiguration>;
}

// eslint-disable-next-line
enum EN_STATES {
  ID = 'request-analysis',
  INITIAL = '0F60D7B1403441B98E2AF6CD47C5A94C',
  EXPORT_OPTION = '9CE23C3B4F1A4E12B9BF51D4F77230F1',

  ASYNC_FUNCTION = '31D1D7180BE24D8ABD7E9D3FAC968E01',
  SYNC_FUNCTION = '70D615E1D33D43A494480676F093AD83',
  HAVE_PARAMETER = '1E4A9134B7314BEA81135BD1FAC3F57E',

  PREPARE_ANALYSIS = '324A1BC5B3494DB3AD4718912CE61DDB',
  FASTIFY_REQUEST_TYPE = 'BA10BADCF2E74D0FA25B32DB2C38503F',
  ANY_TYPE = 'AA0F757A0EA442A38157999C82C92441',
  TYPE_ALIAS_DECLARATION_TYPE = 'C757AF29DFA04FFE85C0F0713C63591F',
  PREPARE_CUSTOM_TYPE = '3EBFD985968C413C8320C5F0F6145575',
  CUSTOM_TYPE = '7FAC9B6CCBB3406986BA0FDFF44711CA',

  VALIDATE_EXPORTATION = '2549C1063A09475AB1A92ED43C5989D4',
  VALIDATE_PROPERTY_SIGNATURE = '26635E161F4F496C8333B805F46A0B34',
  COMPLETE_ANALYSIS = '9B44DFD2A936474F81C41EB95A38D4B2',

  ERROR = 'D7C8DBCF493340009A1AA82E9AFEA42E',
  COMPLETE = '3794670720C542A59D807FDB9993E101',
}

const requestHandlerAnalysisMachine = (
  rootContext: Omit<
    IContextRequestHandlerAnalysisMachine,
    'currentNode' | 'messages' | 'typeNode' | 'importBox' | 'routeBox' | 'useFastifyRequest' | 'typeAliasNode'
  >,
) =>
  createMachine<IContextRequestHandlerAnalysisMachine>(
    {
      id: 'request-analysis',
      initial: EN_STATES.INITIAL,
      context: { ...rootContext, currentNode: 0, messages: [], importBox: {}, routeBox: {}, useFastifyRequest: false },
      states: {
        [EN_STATES.INITIAL]: {
          entry: (context) => {
            consola.debug(`xstate 상태 기계 시작: ${context.currentNode}`);
          },
          always: [
            {
              target: EN_STATES.ANY_TYPE,
              cond: 'isAsyncZeroParameter',
              actions: 'generateAnyTypeReference',
            },
            {
              target: EN_STATES.PREPARE_ANALYSIS,
              cond: 'isAsyncOneParameter',
            },
            {
              target: EN_STATES.PREPARE_ANALYSIS,
              cond: 'isAsyncManyParameter',
            },
            {
              target: EN_STATES.PREPARE_ANALYSIS,
              cond: 'isSyncManyParameter',
            },
            {
              target: EN_STATES.ERROR,
              actions: 'generateSyncNonParameterError',
              // TODO: error 로 가면서 오류를 저장한다 ,
            },
          ],
        },
        // ------------------------------------------------------------------------------------------------------------
        // 내부 상태 기계 시작
        // ------------------------------------------------------------------------------------------------------------
        [EN_STATES.PREPARE_ANALYSIS]: {
          always: [
            {
              target: EN_STATES.FASTIFY_REQUEST_TYPE,
              cond: 'isFastifyRequestType',
              actions: 'assignUseFastifyRequest',
            },
            {
              target: EN_STATES.PREPARE_CUSTOM_TYPE,
              cond: 'isParameterUseCustomType',
              actions: 'assignParameterType',
            },
            {
              target: EN_STATES.ANY_TYPE,
              actions: 'generateAnyTypeReference',
            },
          ],
        },
        [EN_STATES.FASTIFY_REQUEST_TYPE]: {
          always: [
            {
              target: EN_STATES.PREPARE_CUSTOM_TYPE,
              cond: 'isFastifyRequestWithTypeArgument',
              actions: 'assignFastifyTypeArgument',
            },
            {
              target: EN_STATES.ANY_TYPE,
              actions: 'generateAnyTypeReference',
            },
          ],
        },
        [EN_STATES.ANY_TYPE]: {
          always: [
            {
              target: EN_STATES.COMPLETE_ANALYSIS,
            },
          ],
        },
        [EN_STATES.PREPARE_CUSTOM_TYPE]: {
          always: [
            // 여기서는 type alias, custom type을 테스트 해보고 안되면 any type으로
            // 보내는 것이 좀 더 오류를 적게 유발하고 합리적이다
            {
              target: EN_STATES.CUSTOM_TYPE,
              cond: 'isCustomType',
            },
            {
              target: EN_STATES.ANY_TYPE,
              actions: 'generateAnyTypeReference',
            },
          ],
        },
        [EN_STATES.CUSTOM_TYPE]: {
          always: [
            {
              target: EN_STATES.VALIDATE_EXPORTATION,
              cond: 'isValidTypeReferences',
            },
            {
              target: EN_STATES.ERROR,
              actions: 'generateTypeReferenceNotExportReason',
            },
          ],
        },
        [EN_STATES.VALIDATE_EXPORTATION]: {
          always: [
            {
              target: EN_STATES.VALIDATE_PROPERTY_SIGNATURE,
              cond: 'isWarnPropertySignature',
              actions: ['generatePropertySignatureWarnReason', 'generateRouteAndImport'],
            },
            {
              target: EN_STATES.VALIDATE_PROPERTY_SIGNATURE,
              cond: 'isPropertySignature',
              actions: 'generateRouteAndImport',
            },
            {
              target: EN_STATES.ERROR,
              actions: 'generateTypeReferenceNotExportReason',
            },
          ],
        },
        [EN_STATES.VALIDATE_PROPERTY_SIGNATURE]: {
          always: [
            {
              target: EN_STATES.COMPLETE_ANALYSIS,
            },
            {
              target: EN_STATES.ANY_TYPE,
              actions: 'generateAnyTypeReference',
            },
          ],
        },
        [EN_STATES.COMPLETE_ANALYSIS]: {
          always: [
            {
              target: EN_STATES.COMPLETE,
            },
          ],
        },
        // ------------------------------------------------------------------------------------------------------------
        // 내부 상태 기계 끝
        // ------------------------------------------------------------------------------------------------------------
        [EN_STATES.ERROR]: {
          always: [
            {
              // node complete으로 가면서 오류를 context에 저장해야 한다
              target: EN_STATES.COMPLETE,
            },
          ],
        },
        [EN_STATES.COMPLETE]: {
          type: 'final',
          entry: () => {
            consola.debug('분석이 끝?? -3');
          },
          data: (context): Pick<IContextRequestHandlerAnalysisMachine, 'importBox' | 'routeBox' | 'messages'> => {
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
          if (isEmpty(parameter)) {
            throw new Error('Invalid state in assignFastifyTypeArgument: empty parameter');
          }

          // parameter에서 type이 없는 경우 any와 동일하게 처리하면 된다,
          // 그리고 이 상황도 없다, type 없는 경우 이미 ANY_TYPE으로 보냈다
          const parameterTypeNode = parameter.getType();
          if (isEmpty(parameterTypeNode)) {
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
          if (isEmpty(parameter)) {
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
          if (isEmpty(typeArgument)) {
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
            namedBindings: isNotEmpty(next.routeOption)
              ? [
                  {
                    name: 'option',
                    alias: `${appendPostfixHash('option', next.hash)}`,
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
            source: next.source,
          };

          const nextImportBox = { ...next.importBox, [sourceFilePath]: routeFileImportConfiguration };

          const routeConfiguration: IRouteConfiguration = {
            hash: next.hash,
            hasOption: isNotEmpty(next.routeOption),
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
            source: context.source,
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

          const typeReferenceNodes = getTypeReferences(parameter);
          const result = validateTypeReferences({ source, typeReferenceNodes });

          const notExportClassReasons = result.classes.total
            .filter((classNode) => {
              return isFalse(
                result.classes.exported
                  .map((exportedClassNode) => exportedClassNode.getText())
                  .includes(classNode.getText()),
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
              return isFalse(
                result.interfaces.exported
                  .map((exportedClassNode) => exportedClassNode.getText())
                  .includes(interfaceNode.getText()),
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
              return isFalse(
                result.typeAliases.exported
                  .map((exportedClassNode) => exportedClassNode.getText())
                  .includes(typeAliasNode.getText()),
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
          const [typeArgument] = context.useFastifyRequest
            ? parameter.getType().getTypeArguments()
            : [parameter.getType()];

          const routeFileImportConfiguration: IImportConfiguration = {
            hash: next.hash,
            namedBindings: isNotEmpty(next.routeOption)
              ? [
                  {
                    name: 'option',
                    alias: `${appendPostfixHash('option', next.hash)}`,
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
            source: next.source,
          };

          const routeConfiguration: IRouteConfiguration = {
            hash: next.hash,
            hasOption: isNotEmpty(next.routeOption),
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
            source: context.source,
          };

          // TypeReference에 대한 처리를 해준다
          const typeReferenceNodes = getTypeReferences(parameter);
          const everyTypeReferenceNodes = getTypeReferences(parameter, false);
          const resolutions = getResolvedModuleInImports({
            source: context.source,
            option: context.option,
            typeReferenceNodes,
          });

          const localResolutions = getLocalModuleInImports({
            source: context.source,
            option: context.option,
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
                  // https://github.com/dsherret/ts-morph/issues/202
                  // symbol을 호출하고 declaration을 호출해서 declaration에서 text를 얻어낸다

                  const text = getTypeSymbolText(newTypeArgument);
                  return text;
                }

                return typeArgument.getSymbolOrThrow().getEscapedName();
              })()
            : parameter.getTypeNodeOrThrow().getFullText().trim();

          const localDeclarations = getImportConfigurationFromResolutions({
            source: next.source,
            resolutions: localResolutions,
          });

          const localImportConfigurations = dedupeImportConfiguration([
            routeFileImportConfiguration,
            ...localDeclarations,
          ]);

          const externalDeclarations = getImportConfigurationFromResolutions({
            source: next.source,
            resolutions,
          });

          const importConfigurations = dedupeImportConfiguration([
            ...localImportConfigurations,
            ...externalDeclarations,
          ]);

          const record = importConfigurations.reduce<Record<string, IImportConfiguration>>(
            (aggregation, importConfiguration) => {
              if (isEmpty(aggregation[importConfiguration.importFile])) {
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
            isFalse(isFastifyTypeName) &&
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

          if (isEmpty(typeNode)) {
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
            isFalse(isFastifyTypeName) &&
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
