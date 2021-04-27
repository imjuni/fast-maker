import {
  castNode,
  getArrowFunctionWithModifier,
  getDeclarationNodeText,
  getFunctionDeclarationWithModifier,
  isExportStatement,
} from '@compilers/compilerhelper';
import { exists } from '@modules/exists';
import ll from '@modules/ll';
import { TResolvedEither } from '@modules/typehelper';
import { fpGetRoutePath } from '@routes/generator';
import { getMethod, removeStartsSlash } from '@routes/routehelper';
import { getDefaultVariableName, getOptionsVariableName } from '@tools/generator';
import { getHash } from '@tools/hash';
import * as TEI from 'fp-ts/Either';
import * as TFU from 'fp-ts/function';
import { invert, isEmpty, isFalse, isNotEmpty, isTrue, TResolvePromise } from 'my-easy-fp';
import * as path from 'path';
import typescript from 'typescript';
import { IOption } from '@modules/IOption';
import { FastifyInstance } from 'fastify';

const log = ll(__filename);

/**
 * tsconfig 파일을 읽고 ParseCommandLine 객체를 돌려준다
 *
 * @param cwd current working directory, target directory from cli or passed
 * @param filename tsconfig.json filename. If you want to use tsconfig.prod.json or etc, use it.
 */
export async function getTypeScriptConfig({
  tsconfigPath: tsconfigPathFrom,
}: {
  tsconfigPath?: string;
}): Promise<TEI.Either<Error, typescript.ParsedCommandLine>> {
  try {
    const cliPath = process.cwd();
    const tsconfigInCliPath = path.join(cliPath, 'tsconfig.json');
    const tsconfigResolved = isNotEmpty(tsconfigPathFrom)
      ? path.resolve(tsconfigPathFrom)
      : path.resolve(tsconfigInCliPath);

    const tsconfigPath = (await exists(tsconfigResolved))
      ? tsconfigResolved
      : (await exists(tsconfigInCliPath))
      ? path.join(cliPath, tsconfigResolved)
      : undefined;

    log('tsconfig path: ', tsconfigPath);

    if (isEmpty(tsconfigPath)) {
      return TEI.left(new Error(`Cannot found ${tsconfigResolved} in ${tsconfigPathFrom} or ${tsconfigInCliPath}`));
    }

    const parseConfigHost: typescript.ParseConfigHost = {
      fileExists: typescript.sys.fileExists,
      readFile: typescript.sys.readFile,
      readDirectory: typescript.sys.readDirectory,
      useCaseSensitiveFileNames: true,
    };

    const configFile = typescript.readConfigFile(tsconfigPath, typescript.sys.readFile);

    const tsconfig = typescript.parseJsonConfigFileContent(
      configFile.config,
      parseConfigHost,
      path.dirname(tsconfigPath),
    );

    log('tsconfig filenames: ', tsconfig.fileNames.length);

    return TEI.right(tsconfig);
  } catch (err) {
    return TEI.left(err);
  }
}

/**
 * @param param.tsconfig
 * @param param.ignore
 * @returns
 */
export async function getTypeScriptProgram({
  tsconfig,
  ignores,
}: {
  tsconfig: TResolvedEither<TResolvePromise<ReturnType<typeof getTypeScriptConfig>>>;
  ignores: string[];
}): Promise<TEI.Either<Error, { program: typescript.Program; filenames: string[] }>> {
  try {
    const ignoreMap = new Map<string, boolean>(
      ignores.map((ignore) => path.resolve(ignore)).map((resolvedIgnore) => [resolvedIgnore, true]),
    );

    // Exclude exclude file in .ctiignore file: more exclude progress
    const filenames = tsconfig.fileNames
      .map((filename) => path.resolve(filename))
      .filter((filename) => isFalse(ignoreMap.get(filename) ?? false));

    log('typescript configed files: ', tsconfig.fileNames.length);
    log('typescript process ignored files: ', filenames.length);

    const program = typescript.createProgram(filenames, tsconfig.options);

    if (isEmpty(program)) {
      return TEI.left(new Error('invalid source file'));
    }

    return TEI.right({ program, filenames });
  } catch (err) {
    return TEI.left(err);
  }
}

export function getVariableStatement({ source }: { source: typescript.Node }): typescript.VariableStatement[] {
  const statements: typescript.VariableStatement[] = [];
  let statement: typescript.VariableStatement;

  const nodeWalk = (node: typescript.Node) => {
    switch (node.kind) {
      case typescript.SyntaxKind.VariableStatement:
        statement = castNode(node);

        if (isExportStatement(statement)) {
          statements.push(statement);
        }

        break;
    }

    typescript.forEachChild(node, nodeWalk);
  };

  nodeWalk(source);

  return statements;
}

const fpGetImportStatementSourceText = (argsFrom: {
  filename: string;
  base: string;
  hash: string;
  variables: typescript.VariableDeclaration[];
}) =>
  TFU.pipe(
    argsFrom,
    (args) => (args.variables.length > 0 ? TEI.left(args) : TEI.right(args)),
    TEI.fold(
      // options 이름을 가진 배열요소의 길이가 1 이상이면 options이 있는 것으로 간주하고 이름을 생성한다
      (args) => {
        const filename = path.basename(args.filename, '.ts');
        return `import { default as ${getDefaultVariableName({
          filename,
          hash: args.hash,
        })}, options as options_${getOptionsVariableName({ filename, hash: args.hash })} } from './${path.relative(
          args.base,
          path.join(path.dirname(args.filename), path.basename(args.filename, '.ts')),
        )}'`;
      },
      // options 이름을 가진 배열요소의 길이가 0 이하면 options이 없는 것으로 간주하고 이름을 생성한다
      (args) => {
        const filename = path.basename(args.filename, '.ts');
        return `import { default as ${getDefaultVariableName({
          filename,
          hash: args.hash,
        })} } from './${path.relative(
          args.base,
          path.join(path.dirname(args.filename), path.basename(args.filename, '.ts')),
        )}'`;
      },
    ),
  );

/**
 * 파일에 선언된 http handler를 가져온다. async/sync 구분을 하고 function, arrow function을 구분한다
 * @param source 타입스크립트 소스 파일
 */
function getHandleFunction({
  source,
}: {
  source: typescript.Node;
}): Array<{
  type: 'async' | 'sync';
  statement: typescript.Node;
}> {
  const statements: Array<{
    type: 'async' | 'sync';
    statement: typescript.Node;
  }> = [];

  const symbols: Record<string, typescript.VariableDeclaration> = {};
  let symbolName: string | undefined = '';

  const nodeWalk = (node: typescript.Node) => {
    let functionStatement: ReturnType<typeof getFunctionDeclarationWithModifier>;
    let arrowFunctionStatement: ReturnType<typeof getArrowFunctionWithModifier>;

    switch (node.kind) {
      case typescript.SyntaxKind.VariableDeclaration:
        symbolName = getDeclarationNodeText(castNode(node));

        if (isNotEmpty(symbolName)) {
          symbols[symbolName] = castNode(node);
        }

        break;

      // 함수형 선언이 좀 더 장점이 많다. 현재 보이는 장점은 명시적인 이름이 있어서 디버깅과 로깅에 유리하다는 점이다.
      // 특히 이름이 존재한다는 것은 Node.js Best Practices에서 조언하는 것과 같이 문제해결에 매우 중요한 요소이다.
      case typescript.SyntaxKind.FunctionDeclaration:
        functionStatement = getFunctionDeclarationWithModifier(node);

        if (isNotEmpty(functionStatement)) {
          statements.push(functionStatement);
        }

        break;
      // eslint-disable-next-line
      // https://ts-ast-viewer.com/#code/KYDwDg9gTgLgBAE2AMwIYFcA29UGcCeAdgMZwAUAlHALwB8cA3gL4BQLA9O3KJLIihmzkqdRqw5ce0eEjRZ4ydCRgBLCITgALYJkwRKcMW07dw0-nKF4ipRcrUbtu-VTFA
      // AST viewer를 보면 알 수 있겠지만 ExportAssignment가 export default arrow function 이고
      // ExportStatement가 export arrow function 이다. ExportAssignment라는 것으로 이미 default export 된 것.
      case typescript.SyntaxKind.ExportAssignment:
        arrowFunctionStatement = getArrowFunctionWithModifier(symbols, node);

        if (isNotEmpty(arrowFunctionStatement)) {
          statements.push(arrowFunctionStatement);
        }

        break;
    }

    typescript.forEachChild(node, nodeWalk);
  };

  nodeWalk(source);

  return statements;
}

const fpGetApiRouteCodeContent = (args: {
  method: Extract<keyof FastifyInstance, 'get' | 'post' | 'put' | 'options' | 'patch' | 'head' | 'delete'>;
  filename: string;
  asynced: boolean;
  option: IOption;
  optionName?: string;
  defaultName: string;
}): string =>
  TFU.pipe(
    args,
    (argsFrom) => {
      const optionLiteral = isNotEmpty(args.optionName) ? `${args.optionName}, ` : '';
      log(argsFrom.option.template);
      return { ...argsFrom, optionLiteral };
    },
    (argsFrom) =>
      isEmpty(argsFrom.option.template) ||
      isEmpty(argsFrom.option.template.api) ||
      isEmpty(argsFrom.option.template.api.wrapper)
        ? TEI.left(argsFrom)
        : TEI.right({ ...argsFrom, wrapper: argsFrom.option.template.api.wrapper }),
    TEI.fold(
      (argsFrom) => `server.${args.method}('${args.filename}', ${argsFrom.optionLiteral}${argsFrom.defaultName})`,
      (argsFrom) =>
        isTrue(argsFrom.asynced)
          ? `server.${args.method}('${args.filename}', ${argsFrom.optionLiteral}${argsFrom.wrapper.async}(${argsFrom.defaultName}))` // eslint-disable-line
          : `server.${args.method}('${args.filename}', ${argsFrom.optionLiteral}${argsFrom.wrapper.sync}(${argsFrom.defaultName}))`, // eslint-disable-line
    ),
  );

const fpGetPageRouteCodeContent = (args: {
  method: Extract<keyof FastifyInstance, 'get' | 'post' | 'put' | 'options' | 'patch' | 'head' | 'delete'>;
  filename: string;
  asynced: boolean;
  option: IOption;
  optionName?: string;
  defaultName: string;
}): string =>
  TFU.pipe(
    args,
    (argsFrom) => {
      const optionLiteral = isNotEmpty(args.optionName) ? `${args.optionName}, ` : '';
      return { ...argsFrom, optionLiteral };
    },
    (argsFrom) =>
      isEmpty(argsFrom.option.template) ||
      isEmpty(argsFrom.option.template.page) ||
      isEmpty(argsFrom.option.template.page.wrapper)
        ? TEI.left(argsFrom)
        : TEI.right({ ...argsFrom, wrapper: argsFrom.option.template.page.wrapper }),
    TEI.fold(
      (argsFrom) => `server.${args.method}('${args.filename}', ${argsFrom.optionLiteral}${argsFrom.defaultName})`,
      (argsFrom) =>
        isTrue(argsFrom.asynced)
          ? `server.${args.method}('${args.filename}', ${argsFrom.optionLiteral}${argsFrom.wrapper.async}(server, nextHandle, ${argsFrom.defaultName}))` // eslint-disable-line
          : `server.${args.method}('${args.filename}', ${argsFrom.optionLiteral}${argsFrom.wrapper.sync}(server, nextHandle, ${argsFrom.defaultName}))`, // eslint-disable-line
    ),
  );

const fpGetRouteSourceText = (argsFrom: {
  filename: string;
  base: string;
  hash: string;
  isAPI: boolean;
  option: IOption;
  variables: typescript.VariableDeclaration[];
  source: typescript.SourceFile;
}) =>
  TFU.pipe(
    argsFrom,
    (args) => (argsFrom.isAPI ? TEI.left(args) : TEI.right(args)),
    TEI.fold(
      // api 라우팅
      (args) => {
        const routePath = fpGetRoutePath({ filename: args.filename });
        const method = getMethod(args.filename);
        const filename = path.basename(args.filename, '.ts');
        const optionsName = getOptionsVariableName({ filename, hash: args.hash });
        const defaultName = getDefaultVariableName({ filename, hash: args.hash });
        const statements = getHandleFunction({ source: args.source });
        const asynced = statements.filter((statement) => statement.type === 'async').length > 0;

        return {
          async: asynced,
          type: 'api',
          options: true,
          content: fpGetApiRouteCodeContent({
            method,
            filename: routePath.filename,
            optionName: argsFrom.variables.length > 0 ? optionsName : undefined,
            option: args.option,
            asynced,
            defaultName,
          }),
        };
      },
      // render 라우팅
      (args) => {
        const routePath = fpGetRoutePath({ filename: args.filename });
        const filename = path.basename(args.filename, '.ts');
        const method = getMethod(args.filename);
        const optionsName = getOptionsVariableName({ filename, hash: args.hash });
        const defaultName = getDefaultVariableName({ filename, hash: args.hash });
        const statements = getHandleFunction({ source: args.source });
        const asynced = statements.filter((statement) => statement.type === 'async').length > 0;

        return {
          async: true,
          options: true,
          type: 'page',
          content: fpGetPageRouteCodeContent({
            method,
            filename: routePath.filename,
            option: args.option,
            asynced,
            optionName: argsFrom.variables.length > 0 ? optionsName : undefined,
            defaultName,
          }),
        };
      },
    ),
  );

/**
 * import statement를 생성한다. 상단에 추가되고, options이 있는가 없는가에 따라서 import statement 형태가 달라진다.
 * @param args.filename 대상 파일이름
 * @param args.program TypeScript 컴파일 후 생성된 전체 프로그램
 */
export function getSourceText(args: { filename: string; option: IOption; program: typescript.Program }) {
  const source = args.program.getSourceFile(args.filename);

  if (isEmpty(source)) {
    throw new Error(`Source-code is empty: ${args.filename}`);
  }

  const statements = getVariableStatement({ source });
  const dirname = path.dirname(args.filename);

  const isAPI = isFalse(isNotEmpty(args.option.path.page) && dirname.indexOf(args.option.path.page) >= 0);
  const base = path.join(args.option.path.output);
  const hash = getHash(args.filename);

  const variables = statements
    .map((statement) =>
      statement.declarationList.declarations.find((declaration) => declaration.name?.getText() === 'options'),
    )
    .flatMap((statement) => statement)
    .filter((statement): statement is typescript.VariableDeclaration => isNotEmpty(statement));

  const importSourceText = fpGetImportStatementSourceText({ filename: args.filename, base, variables, hash });
  const routeSourceText = fpGetRouteSourceText({
    option: args.option,
    filename: args.filename,
    base,
    isAPI,
    variables,
    hash,
    source,
  });

  log('source-text: ', variables.length, importSourceText, routeSourceText);

  return { importSourceText, routeSourceText };
}

export function getStatement(args: { filename: string; option: IOption; program: typescript.Program }) {
  return getSourceText({ filename: args.filename, option: args.option, program: args.program });
}

export function getAPIWrapImport(args: { asyncCount: number; syncCount: number; option: IOption }) {
  if (args.asyncCount > 0 && args.syncCount > 0) {
    return `${args.option.template?.api?.import?.all ?? ''}\n`;
  }

  if (args.asyncCount > 0 && args.syncCount <= 0) {
    return `${args.option.template?.api?.import?.async ?? ''}\n`;
  }

  if (args.asyncCount <= 0 && args.syncCount > 0) {
    return `${args.option.template?.api?.import?.sync ?? ''}\n`;
  }

  return '';
}

export function getPageWrapImport(args: { asyncCount: number; syncCount: number; option: IOption }) {
  if (args.asyncCount > 0 && args.syncCount > 0) {
    log('getPageWrapImport - 01');
    return `${args.option.template?.page?.import?.all ?? ''}\n`;
  }

  if (args.asyncCount > 0 && args.syncCount <= 0) {
    log('getPageWrapImport - 02');
    return `${args.option.template?.page?.import?.async ?? ''}\n`;
  }

  if (args.asyncCount <= 0 && args.syncCount > 0) {
    log('getPageWrapImport - 03');
    return `${args.option.template?.page?.import?.sync ?? ''}\n`;
  }

  log('getPageWrapImport - 04');
  return '';
}
