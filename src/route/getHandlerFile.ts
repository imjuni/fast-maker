import fastGlob from 'fast-glob';
import { isEmpty, isFalse } from 'my-easy-fp';
import { exists, replaceSepToPosix } from 'my-node-fp';
import * as path from 'path';

export default async function getHandlerFile(handlersPath?: string): Promise<string[]> {
  try {
    if (isEmpty(handlersPath)) {
      return [];
    }

    if (isFalse(await exists(handlersPath))) {
      return [];
    }

    const tsfileGlobs = replaceSepToPosix(path.resolve(handlersPath, '**', '*.ts'));
    const ignoreFileGlobs = [
      replaceSepToPosix(path.resolve(handlersPath, '**', 'interface')),
      replaceSepToPosix(path.resolve(handlersPath, '**', 'interfaces')),
      replaceSepToPosix(path.resolve(handlersPath, '**', '*.d.ts')),
      replaceSepToPosix(path.resolve(handlersPath, '**', 'JSC_*')),
      replaceSepToPosix(path.resolve(handlersPath, '**', 'test')),
      replaceSepToPosix(path.resolve(handlersPath, '**', 'tests')),
      replaceSepToPosix(path.resolve(handlersPath, '**', '__test__')),
      replaceSepToPosix(path.resolve(handlersPath, '**', '__tests__')),
    ];

    const globResult = await fastGlob(tsfileGlobs, { ignore: ignoreFileGlobs });
    const sortedGlobResult = globResult.sort();

    return sortedGlobResult;
  } catch (err) {
    return [];
  }
}
