import { exists } from '@modules/exists';
import ll from '@modules/ll';
import fastGlob from 'fast-glob';
import { FastifyInstance } from 'fastify';
import { isEmpty, isFalse } from 'my-easy-fp';
import path from 'path';
import * as uuid from 'uuid';

const log = ll(__filename);

export function removeEndsSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, value.length - 1) : value;
}

export function removeStartsSlash(value: string): string {
  return value.startsWith('/') ? value.slice(1, value.length) : value;
}

export function addStartsSlash(value: string): string {
  return value.startsWith('/') ? value : `/${value}`;
}

export function replaceSepToPosix(targetPath: string): string {
  if (path.sep !== '/') {
    const replaced = path.posix.join(...targetPath.split(path.sep));

    if (targetPath.startsWith(path.sep)) {
      return `${path.posix.sep}${replaced}`;
    }

    return replaced;
  }

  return targetPath;
}

export const getMethod = (
  filename: string,
): Extract<keyof FastifyInstance, 'get' | 'post' | 'put' | 'options' | 'patch' | 'head' | 'delete'> => {
  if (filename.indexOf('post') >= 0) {
    return 'post';
  }

  if (filename.indexOf('put') >= 0) {
    return 'put';
  }

  if (filename.indexOf('delete') >= 0) {
    return 'delete';
  }

  if (filename.indexOf('options') >= 0) {
    return 'options';
  }

  if (filename.indexOf('patch') >= 0) {
    return 'patch';
  }

  if (filename.indexOf('head') >= 0) {
    return 'head';
  }

  return 'get';
};

async function getHandlerFile(handlersPath?: string): Promise<string[]> {
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
    ];

    const result = await fastGlob(tsfileGlobs, { ignore: ignoreFileGlobs });

    return result;
  } catch (err) {
    return [];
  }
}

export async function getRouteFiles({ apiPath, pagePath }: { apiPath: string; pagePath?: string }) {
  log('path: ', 'api - ', apiPath, 'page - ', pagePath);

  const [getAPIs, postAPIs, putAPIs, deleteAPIs, getPages] = await Promise.all([
    getHandlerFile(path.join(apiPath, 'get')),
    getHandlerFile(path.join(apiPath, 'post')),
    getHandlerFile(path.join(apiPath, 'put')),
    getHandlerFile(path.join(apiPath, 'delete')),
    getHandlerFile(path.join(pagePath ?? uuid.v4(), 'get')),
  ]);

  log('files: ', getPages);

  return {
    get: getAPIs,
    post: postAPIs,
    put: putAPIs,
    delete: deleteAPIs,
    pages: getPages,
  };
}
