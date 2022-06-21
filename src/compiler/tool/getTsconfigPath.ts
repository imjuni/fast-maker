import { isFalse, isNotEmpty } from 'my-easy-fp';
import { exists, isDirectory } from 'my-node-fp';
import { fail, pass, PassFailEither } from 'my-only-either';
import * as path from 'path';

export default async function getTsconfigPath(tsconfigPath?: string): Promise<PassFailEither<Error, string>> {
  // tsconfigPath is non empty
  if (isNotEmpty(tsconfigPath)) {
    const isTsconfigFileExist = await exists(tsconfigPath);

    // if exists tsconfig file, return it
    if (isTsconfigFileExist && isFalse(await isDirectory(tsconfigPath))) {
      return pass(tsconfigPath);
    }

    // non exists, throw exception
    return fail(new Error(`tsconfig file not exist: ${tsconfigPath}`));
  }

  const tsconfigOnCwd = path.join(process.cwd(), 'tsconfig.json');
  const isTsconfigFileExist = await exists(tsconfigOnCwd);

  if (isTsconfigFileExist) {
    return pass(tsconfigOnCwd);
  }

  return fail(new Error(`tsconfig file not exist: ${tsconfigOnCwd}`));
}
