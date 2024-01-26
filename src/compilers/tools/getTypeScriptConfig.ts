import * as path from 'path';
import * as tsm from 'ts-morph';

/**
 * tsconfig 파일을 읽고 ParseCommandLine 객체를 돌려준다
 *
 * @param tsconfigPath current working directory, target directory from cli or passed
 */
export async function getTypeScriptConfig(project: string): Promise<tsm.ts.ParsedCommandLine> {
  const resolvedProjectPath = path.resolve(project);
  const parseConfigHost: tsm.ts.ParseConfigHost = {
    fileExists: tsm.ts.sys.fileExists.bind(tsm.ts),
    readFile: tsm.ts.sys.readFile.bind(tsm.ts),
    readDirectory: tsm.ts.sys.readDirectory.bind(tsm.ts),
    useCaseSensitiveFileNames: true,
  };

  const configFile = tsm.ts.readConfigFile(resolvedProjectPath, tsm.ts.sys.readFile.bind(tsm.ts));

  const tsconfig = tsm.ts.parseJsonConfigFileContent(
    configFile.config,
    parseConfigHost,
    path.dirname(resolvedProjectPath),
  );

  return tsconfig;
}
