import THandlerNode, { IOptionStatement } from '@compiler/interface/THandlerNode';
import getArrowFunctionWithModifier from '@compiler/navigate/getArrowFunctionWithModifier';
import getFunctionDeclarationWithModifier from '@compiler/navigate/getFunctionDeclarationWithModifier';
import { isEmpty, isNotEmpty } from 'my-easy-fp';
import * as tsm from 'ts-morph';

/**
 * 파일에 선언된 http handler를 가져온다. async/sync 구분을 하고 function, arrow function을 구분한다
 *
 * Route handler get from sourceFile object. After collect information that async/sync and classify
 * function and arrow function
 * @param sourceFile TypeScript source file object, tsm.SourceFile object
 */
export default function getHandlerWithOption(sourceFile: tsm.SourceFile): THandlerNode[] {
  const declarationMap = sourceFile.getExportedDeclarations();
  const defaultExportedNodes = declarationMap.get('default');
  const optionNamedExportedNodes = declarationMap.get('option');

  const nodes = [
    (() => {
      if (isNotEmpty(optionNamedExportedNodes)) {
        const variableDeclarationNode = optionNamedExportedNodes.find(
          (optionNode) => optionNode.getKind() === tsm.SyntaxKind.VariableDeclaration,
        );

        if (isEmpty(variableDeclarationNode)) {
          return undefined;
        }

        const optionStatement: IOptionStatement = { kind: 'option', node: variableDeclarationNode };
        return optionStatement;
      }

      return undefined;
    })(),
    (() => {
      if (isNotEmpty(defaultExportedNodes)) {
        if (defaultExportedNodes.some((handlerNode) => handlerNode.getKind() === tsm.SyntaxKind.ArrowFunction)) {
          return getArrowFunctionWithModifier(defaultExportedNodes);
        }

        if (defaultExportedNodes.some((handlerNode) => handlerNode.getKind() === tsm.SyntaxKind.VariableDeclaration)) {
          const [firstNode] = defaultExportedNodes;
          const variableDeclarationNode = firstNode.asKindOrThrow(tsm.SyntaxKind.VariableDeclaration);

          const initialiezer = variableDeclarationNode.getInitializerOrThrow();
          const identifier = variableDeclarationNode.getNameNode().asKindOrThrow(tsm.SyntaxKind.Identifier);

          return getArrowFunctionWithModifier([identifier, initialiezer]);
        }

        if (defaultExportedNodes.some((handlerNode) => handlerNode.getKind() === tsm.SyntaxKind.FunctionDeclaration)) {
          return getFunctionDeclarationWithModifier(defaultExportedNodes);
        }

        return undefined;
      }

      return undefined;
    })(),
  ].filter((node): node is THandlerNode => isNotEmpty(node));

  return nodes;
}
