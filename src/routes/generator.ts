import { IOption } from '@modules/IOption';
import ll from '@modules/ll';
import { addStartsSlash, removeStartsSlash } from '@routes/routehelper';
import * as TFU from 'fp-ts/function';
import { isFalse, isNotEmpty, isTrue } from 'my-easy-fp';
import path from 'path';
import urljoin from 'url-join';

const log = ll(__filename);

export const fpGetRoutePath = (argsFrom: { filename: string; option: IOption; isAPI: boolean }) =>
  TFU.pipe(
    argsFrom,
    (args) => ({
      ...args,
      filename: removeStartsSlash(args.filename),
    }),
    (args) => {
      log(' 1 >>> ', args.filename);

      return {
        ...args,
        filename: args.filename.replace(/(.*)(\/|)(get|post|put|delete)(\/|)(.+)(\.ts)/, '$5'),
      };
    },
    (args) => {
      log(' 2 >>> ', args.filename);

      const paramsApplied = args.filename
        .split(path.sep)
        .filter((endpoint) => endpoint !== '')
        .map((endpoint) => {
          const reg = new RegExp(`(\\[|)([0-9a-zA-Z]+)(\\]|)(\\.ts|)`, 'gm');
          const matched = reg.exec(endpoint);

          if (matched === null) {
            throw new Error(`invalid endpoint: ${args.filename} ${endpoint}`);
          }

          const [, startBracket, filename] = matched;

          if (startBracket !== '[' && filename === 'index') {
            return undefined;
          }

          if (startBracket !== '[') {
            return filename;
          }

          return `:${filename}`;
        })
        .filter((item): item is string => item !== undefined);

      return { ...args, filename: paramsApplied };
    },
    (args) => {
      let joined = urljoin(args.filename);

      log(' >>> ', args.option.prefix, joined);

      if (isFalse(args.isAPI) && isNotEmpty(args.option.prefix?.page)) {
        joined = urljoin(args.option.prefix?.page ?? '', joined);
      } else if (isTrue(args.isAPI) && isNotEmpty(args.option.prefix?.api)) {
        joined = urljoin(args.option.prefix?.api ?? 'api', joined);
      }

      return { ...args, filename: addStartsSlash(joined) };
    },
  );
