import consola from 'consola';
import { fail, pass, PassFailEither } from 'my-only-either';
import * as path from 'path';
import typescript from 'typescript';

/**
 * tsconfig 파일을 읽고 ParseCommandLine 객체를 돌려준다
 *
 * @param tsconfigPath current working directory, target directory from cli or passed
 */
export default async function getTypeScriptConfig({
  tsconfigPath,
}: {
  tsconfigPath: string;
}): Promise<PassFailEither<Error, typescript.ParsedCommandLine>> {
  try {
    consola.debug(`tsconfig file load from "${tsconfigPath}"`);

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

    consola.debug(`number of typescript source file: ${tsconfig.fileNames.length}`);

    return pass(tsconfig);
  } catch (catched) {
    const err = catched instanceof Error ? catched : new Error('unknown error raised');

    return fail(err);
  }
}
