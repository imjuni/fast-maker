import ll from '@modules/ll';
import { isEmpty, isNotEmpty } from 'my-easy-fp';
import typescript from 'typescript';

const log = ll(__filename);

export function getText(node: typescript.Node): string {
  try {
    if ('escapedText' in node) {
      const escapedText: typescript.__String = (node as any).escapedText as any;
      return getTypeScriptString(escapedText); // eslint-disable-line
    }

    if ('getText' in node) {
      return node.getText();
    }

    return '';
  } catch (err) {
    return '';
  }
}

export function getTypeScriptString(value?: typescript.__String): string {
  try {
    if (isEmpty(value)) {
      return '';
    }

    if (isNotEmpty(value.toString)) {
      return value.toString();
    }

    return String(value);
  } catch (catched) {
    const err = catched instanceof Error ? catched : new Error('unknown error raised');

    log(err.message);
    log(err.stack);

    return '';
  }
}

export function castNode<T extends typescript.Node>(value: typescript.Node): T {
  return value as any; // eslint-disable-line
}

export function isExportStatement(node: typescript.VariableStatement): boolean {
  if (node.modifiers === undefined || node.modifiers === null) {
    return false;
  }

  // eslint-disable-next-line
  for (const modifier of node.modifiers) {
    if (modifier.kind === typescript.SyntaxKind.ExportKeyword) {
      return true;
    }
  }

  return false;
}

export function getModifierArray(modifiers: typescript.ModifiersArray | undefined): typescript.Modifier[] {
  if (isEmpty(modifiers)) {
    return [];
  }

  return modifiers.map((modifier) => modifier);
}

export function getFunctionDeclarationWithModifier(node: typescript.Node):
  | {
      type: 'async' | 'sync';
      statement: typescript.Node;
    }
  | undefined {
  const statement: typescript.FunctionDeclaration = castNode(node);

  // 필수 조건
  const exportKeywords = getModifierArray(statement.modifiers).filter(
    (modifier: typescript.Modifier) => modifier.kind === typescript.SyntaxKind.ExportKeyword,
  );

  const defaultKeywords = getModifierArray(statement.modifiers).filter(
    (modifier) => modifier.kind === typescript.SyntaxKind.DefaultKeyword,
  );

  // 충분 조건
  const asyncKeyword = getModifierArray(statement.modifiers).filter(
    (modifier) => modifier.kind === typescript.SyntaxKind.AsyncKeyword,
  );

  if (exportKeywords.length > 0 && defaultKeywords.length > 0 && asyncKeyword.length > 0) {
    // 비동기 함수
    return { type: 'async', statement };
  }

  if (exportKeywords.length > 0 && defaultKeywords.length > 0) {
    // 동기함수
    return { type: 'sync', statement };
  }

  return undefined;
}

export function extractArrowFunctionModifier({
  symbols,
  statement,
}: {
  statement: typescript.ExportAssignment;
  symbols: Record<string, typescript.VariableDeclaration>;
}) {
  if (statement.expression.kind === typescript.SyntaxKind.ArrowFunction) {
    const arrowFunction: typescript.ArrowFunction = castNode(statement.expression);

    // 충분 조건
    return {
      asyncKeyword: getModifierArray(arrowFunction.modifiers).filter(
        (modifier) => modifier.kind === typescript.SyntaxKind.AsyncKeyword,
      ),
      statement: arrowFunction,
    };
  }

  const identifier: typescript.Identifier = castNode(statement.expression);
  const name = getTypeScriptString(identifier.escapedText);
  const declaration = symbols[name];

  if (isEmpty(declaration)) {
    return undefined;
  }

  const { initializer } = declaration;

  if (isEmpty(initializer)) {
    return undefined;
  }

  if (initializer.kind !== typescript.SyntaxKind.ArrowFunction) {
    return undefined;
  }

  // 충분 조건
  return {
    asyncKeyword: getModifierArray(initializer.modifiers).filter(
      (modifier) => modifier.kind === typescript.SyntaxKind.AsyncKeyword,
    ),
    statement: initializer,
  };
}

/**
 * Arrow function에서 identifier 노드를 얻어낸다. identifier 노드를 얻어서 추후 route.ts 파일을 생성할 때
 * identifier 노드에서 name 필드를 얻어서 fastify handler에 전달하는 역할을 한다.
 *
 * @param symbols
 * @param node
 * @returns
 */
export function getArrowFunctionWithModifier(
  symbols: Record<string, typescript.VariableDeclaration>,
  node: typescript.Node,
):
  | {
      type: 'async' | 'sync';
      statement: typescript.Node;
    }
  | undefined {
  const statement: typescript.ExportAssignment = castNode(node);

  // case 01. Error
  if (isEmpty(statement.expression)) {
    return undefined;
  }

  const keyword = extractArrowFunctionModifier({ statement, symbols });

  // log(
  //   '>>> keyword: ',
  //   statement,
  //   statement.kind,
  //   getModifierArray(statement.modifiers)
  //     .map((m) => m.kind)
  //     .join(', '),
  //   keyword,
  // );

  if (isEmpty(keyword)) {
    return undefined;
  }

  if (keyword.asyncKeyword.length > 0) {
    // 비동기 함수
    return { type: 'async', statement: keyword.statement };
  }

  // 동기함수
  return { type: 'sync', statement: keyword.statement };
}

export function getIdentifierNodeText(node: typescript.Identifier): string | undefined {
  try {
    return getTypeScriptString(node.escapedText);
  } catch {
    return undefined;
  }
}

export function getDeclarationNodeText(node: typescript.VariableDeclaration): string | undefined {
  try {
    return getIdentifierNodeText(castNode<typescript.Identifier>(node.name));
  } catch {
    return undefined;
  }
}
