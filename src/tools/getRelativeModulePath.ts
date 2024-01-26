import { CE_EXT_KIND } from '#/configs/const-enum/CE_EXT_KIND';
import { getNextExtName } from '#/tools/getNextExtName';
import { basenames, replaceSepToPosix, startSepAppend } from 'my-node-fp';
import path from 'node:path';

export function getRelativeModulePath(params: { modulePath: string; output: string; extKind: CE_EXT_KIND }) {
  const dirName = path.dirname(params.modulePath);
  const fileName = basenames(params.modulePath, [
    CE_EXT_KIND.JS,
    CE_EXT_KIND.MJS,
    CE_EXT_KIND.CJS,
    CE_EXT_KIND.TS,
    CE_EXT_KIND.CTS,
    CE_EXT_KIND.MTS,
  ]);
  const fromExtName = path.extname(params.modulePath);
  const toExtName = getNextExtName(params.extKind, fromExtName);
  const relativePath = path.relative(params.output, dirName);

  const modulePath = replaceSepToPosix(path.posix.join(relativePath, `${fileName}${toExtName}`));

  if (modulePath.startsWith('.')) {
    return modulePath;
  }

  return `.${startSepAppend(modulePath)}`;
}
