import { fail, pass, PassFailEither } from 'my-only-either';
import * as tsm from 'ts-morph';

/**
 * @param param.tsconfig
 * @param param.ignore
 * @returns
 */
export default async function getTypeScriptProject(projectPath: string): Promise<PassFailEither<Error, tsm.Project>> {
  try {
    // Exclude exclude file in .ctiignore file: more exclude progress
    const project = new tsm.Project({ tsConfigFilePath: projectPath });
    return pass(project);
  } catch (catched) {
    const err = catched instanceof Error ? catched : new Error('unknown error raised');

    return fail(err);
  }
}
