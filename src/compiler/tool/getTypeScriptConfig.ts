import logger from '#tool/logger';
import * as path from 'path';
import typescript from 'typescript';

const log = logger();

/**
 * tsconfig 파일을 읽고 ParseCommandLine 객체를 돌려준다
 *
 * @param tsconfigPath current working directory, target directory from cli or passed
 */
export default async function getTypeScriptConfig(tsconfigPath: string): Promise<typescript.ParsedCommandLine> {
  log.debug(`tsconfig file load from "${tsconfigPath}"`);

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

  log.debug(`number of typescript source file: ${tsconfig.fileNames.length}`);

  return tsconfig;
}
