import { CE_DEFAULT_VALUE } from '#/configs/const-enum/CE_DEFAULT_VALUE';
import { exists } from 'my-node-fp';
import path from 'node:path';

export async function getTemplatePath(templatePathParam?: string): Promise<string> {
  if (templatePathParam != null && (await exists(path.resolve(templatePathParam)))) {
    return path.resolve(templatePathParam);
  }

  const currentFilePath = path.resolve(__dirname);

  if (templatePathParam != null) {
    const currentWithTemplatePath = path.resolve(path.join(currentFilePath, templatePathParam));
    if (await exists(currentWithTemplatePath)) {
      return currentWithTemplatePath;
    }
  }

  const packageRootTemplatePath = path.resolve(path.join(currentFilePath, '..', '..', CE_DEFAULT_VALUE.TEMPLATES_PATH));
  if (await exists(packageRootTemplatePath)) {
    return packageRootTemplatePath;
  }

  const distTemplatePath = path.resolve(path.join(currentFilePath, '..', CE_DEFAULT_VALUE.TEMPLATES_PATH));
  if (await exists(distTemplatePath)) {
    return distTemplatePath;
  }

  throw new Error('cannot found template directory!');
}
