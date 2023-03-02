import logger from '#tools/logging/logger';
import * as path from 'path';
import ts from 'typescript';

const log = logger();

/**
 * tsconfig 파일을 읽고 ParseCommandLine 객체를 돌려준다
 *
 * @param tsconfigPath current working directory, target directory from cli or passed
 */
export default async function getTypeScriptConfig(tsconfigPath: string): Promise<ts.ParsedCommandLine> {
  log.debug(`tsconfig file load from "${tsconfigPath}"`);

  const parseConfigHost: ts.ParseConfigHost = {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    fileExists: ts.sys.fileExists,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    readFile: ts.sys.readFile,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    readDirectory: ts.sys.readDirectory,
    useCaseSensitiveFileNames: true,
  };

  const configFile = ts.readConfigFile(tsconfigPath, (filePath: string, encoding?: string) =>
    ts.sys.readFile(filePath, encoding),
  );

  const tsconfig = ts.parseJsonConfigFileContent(configFile.config, parseConfigHost, path.dirname(tsconfigPath));

  log.debug(`number of typescript source file: ${tsconfig.fileNames.length}`);

  return tsconfig;
}
