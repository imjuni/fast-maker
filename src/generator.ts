/* eslint max-len: ["error", { "code": 130, "ignoreStrings": true, "ignoreComments": true }] */

import {
  getAPIWrapImport,
  getPageWrapImport,
  getStatement,
  getTypeScriptConfig,
  getTypeScriptProgram,
} from '@compilers/generator';
import ll from '@modules/ll';
import { getRouteFiles } from '@routes/routehelper';
import chalk from 'chalk';
import * as TEI from 'fp-ts/Either';
import * as TFU from 'fp-ts/function';
import * as TTE from 'fp-ts/TaskEither';
import * as fs from 'fs';
import { isFalse } from 'my-easy-fp';
import * as path from 'path';
import prettier from 'prettier';
import { IOption } from '@modules/IOption';

const log = ll(__filename);

function getTsconfigPath(tsconfigPath: string) {
  const basename = path.basename(tsconfigPath);

  if (basename === 'tsconfig.json') {
    return tsconfigPath;
  }

  return path.join(tsconfigPath, 'tsconfig.json');
}

export async function generator(option: IOption) {
  try {
    const cwd = path.resolve(process.cwd());
    const tsconfigPath = getTsconfigPath(option.path.tsconfig);

    const files = await getRouteFiles({ apiPath: option.path.api, pagePath: option.path.page });

    log('files: ', files);

    const program = await TFU.pipe(
      () => getTypeScriptConfig({ tsconfigPath }),
      TTE.chain((args) => () => getTypeScriptProgram({ tsconfig: args, ignores: [] })),
    )();

    if (TEI.isLeft(program)) {
      console.log(chalk`{red Error occured} from TypeScript config read or parsing`);
      process.exit(0);
    }

    const gets = files.get.map((filename) => getStatement({ filename, option, program: program.right.program }));
    const posts = files.post.map((filename) => getStatement({ filename, option, program: program.right.program }));
    const puts = files.put.map((filename) => getStatement({ filename, option, program: program.right.program }));
    const deletes = files.delete.map((filename) => getStatement({ filename, option, program: program.right.program }));
    const pages = files.pages.map((filename) => getStatement({ filename, option, program: program.right.program }));

    const asyncCount = [...gets, ...posts, ...puts, ...deletes, ...pages]
      .map((route) => route.routeSourceText)
      .filter((routeSourceText) => routeSourceText.type === 'api' && routeSourceText.async).length;

    const syncCount = [...gets, ...posts, ...puts, ...deletes, ...pages]
      .map((route) => route.routeSourceText)
      .filter((routeSourceText) => routeSourceText.type === 'api' && isFalse(routeSourceText.async)).length;

    const asyncPageCount = [...pages]
      .map((route) => route.routeSourceText)
      .filter((routeSourceText) => routeSourceText.type === 'pages' && routeSourceText.async).length;

    const syncPageCount = [...pages]
      .map((route) => route.routeSourceText)
      .filter((routeSourceText) => routeSourceText.type === 'pages' && isFalse(routeSourceText.async)).length;

    const importStatements = [...gets, ...posts, ...puts, ...deletes, ...pages]
      .map((imported) => imported.importSourceText)
      .join('\n');

    const routeAPIStatements = [...gets, ...posts, ...puts, ...deletes]
      .map((imported) => imported.routeSourceText.content)
      .join('\n');
    const routePageStatements = [...pages].map((imported) => imported.routeSourceText.content).join('\n');

    const fileContent = `import { FastifyInstance } from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';${getAPIWrapImport({
      option,
      asyncCount,
      syncCount,
    })}${getPageWrapImport({ option, asyncCount: asyncPageCount, syncCount: syncPageCount })}${importStatements}

    ${
      routeAPIStatements !== ''
        ? `// ----------------------------------------------------------------------------------------------------
    // Generated server route function start
    export function server(server: FastifyInstance<Server, IncomingMessage, ServerResponse>): void {
    ${routeAPIStatements}
    }
    // Generated server route function start
    // ----------------------------------------------------------------------------------------------------`
        : ''
    }

    ${
      routePageStatements !== ''
        ? `// ----------------------------------------------------------------------------------------------------
// Generated client route function start
export function client(
  server: FastifyInstance<Server, IncomingMessage, ServerResponse>, 
  nextHandle: (req: IncomingMessage, res: ServerResponse, parsedUrl?: UrlWithParsedQuery) => Promise<void>
): void {
${routePageStatements}
}
// Generated client route function start
// ----------------------------------------------------------------------------------------------------`
        : ''
    }`;

    const prettierOption = await prettier.resolveConfig(cwd);

    const prettiered = prettier.format(
      fileContent,
      prettierOption === null
        ? {
            singleQuote: true,
            trailingComma: 'all',
            printWidth: 120,
            arrowParens: 'always',
            parser: 'typescript',
          }
        : prettierOption,
    );

    log(prettiered);

    await fs.promises.writeFile(path.resolve(option.path.output, 'route.ts'), prettiered);
  } catch (err) {
    log(err.message);
    log(err.stack);
  }
}
