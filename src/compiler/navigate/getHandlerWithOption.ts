import type THandlerNode from '#compiler/interface/THandlerNode';
import type { IOptionStatement } from '#compiler/interface/THandlerNode';
import getArrowFunctionWithModifier from '#compiler/navigate/getArrowFunctionWithModifier';
import getFunctionDeclarationWithModifier from '#compiler/navigate/getFunctionDeclarationWithModifier';
import type { SourceFile } from 'ts-morph';
import { SyntaxKind } from 'ts-morph';

/**
 * 파일에 선언된 http handler를 가져온다. async/sync 구분을 하고 function, arrow function을 구분한다
 *
 * Route handler get from sourceFile object. After collect information that async/sync and classify
 * function and arrow function
 * @param sourceFile TypeScript source file object, tsm.SourceFile object
 */
export default function getHandlerWithOption(sourceFile: SourceFile): THandlerNode[] {
  const declarationMap = sourceFile.getExportedDeclarations();
  const defaultExportedNodes = declarationMap.get('default');
  const optionNamedExportedNodes = declarationMap.get('option');

  const nodes = [
    (() => {
      if (optionNamedExportedNodes != null) {
        const variableDeclarationNode = optionNamedExportedNodes.find(
          (optionNode) => optionNode.getKind() === SyntaxKind.VariableDeclaration,
        );

        if (variableDeclarationNode == null) {
          return undefined;
        }

        const optionStatement: IOptionStatement = { kind: 'option', node: variableDeclarationNode };
        return optionStatement;
      }

      return undefined;
    })(),
    (() => {
      if (defaultExportedNodes != null) {
        if (defaultExportedNodes.some((handlerNode) => handlerNode.getKind() === SyntaxKind.ArrowFunction)) {
          return getArrowFunctionWithModifier(defaultExportedNodes);
        }

        if (defaultExportedNodes.some((handlerNode) => handlerNode.getKind() === SyntaxKind.VariableDeclaration)) {
          const [firstNode] = defaultExportedNodes;
          const variableDeclarationNode = firstNode.asKindOrThrow(SyntaxKind.VariableDeclaration);

          const initialiezer = variableDeclarationNode.getInitializerOrThrow();
          const identifier = variableDeclarationNode.getNameNode().asKindOrThrow(SyntaxKind.Identifier);

          return getArrowFunctionWithModifier([identifier, initialiezer]);
        }

        if (defaultExportedNodes.some((handlerNode) => handlerNode.getKind() === SyntaxKind.FunctionDeclaration)) {
          return getFunctionDeclarationWithModifier(defaultExportedNodes);
        }

        return undefined;
      }

      return undefined;
    })(),
  ].filter((node): node is THandlerNode => node != null);

  return nodes;
}
