import { CE_DEFAULT_VALUE } from '#/configs/interfaces/CE_DEFAULT_VALUE';
import type { TWatchOption } from '#/configs/interfaces/TWatchOption';
import getOutputFilePath from '#/modules/getOutputFilePath';
import getOutputMapFilePath from '#/modules/getOutputMapFilePath';
import getRelativeCwd from '#/tools/getRelativeCwd';
import fastGlob from 'fast-glob';
import fs from 'fs';
import { isDescendant } from 'my-node-fp';
import path from 'path';
import ts from 'typescript';

export default async function getWatchFiles(
  option: Pick<TWatchOption, 'project' | 'output' | 'routeMap' | 'cwd' | 'handler'>,
): Promise<string[]> {
  try {
    const configFile = ts.readConfigFile(option.project, (filePath: string) => fs.readFileSync(filePath).toString());

    const files = (configFile.config as Partial<Record<string, string[]>>).include ?? [
      CE_DEFAULT_VALUE.WATCH_DEFAULT_GLOB,
    ];

    const ignore = option.routeMap
      ? [
          // 생성되는 route.ts 파일은 watch 항목에서 제거한다
          // ignore route.ts file in watch file list
          getRelativeCwd(option.cwd, getOutputFilePath(option.output)),
          // 생성되는 route-map.ts 파일은 watch 항목에서 제거한다
          // ignore route-map.ts file in watch file list
          getRelativeCwd(option.cwd, getOutputMapFilePath(option.output)),
        ]
      : [getRelativeCwd(option.cwd, getOutputFilePath(option.output))];

    const includes = await fastGlob(files, {
      cwd: option.cwd,
      ignore,
    });

    const underHandlers = includes
      .map((filePath) => path.join(option.cwd, filePath))
      .filter((filePath) => isDescendant(option.handler, filePath));

    return underHandlers;
  } catch {
    return [CE_DEFAULT_VALUE.WATCH_DEFAULT_GLOB];
  }
}
