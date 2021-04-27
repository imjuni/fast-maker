import { removeStartsSlash } from '@routes/routehelper';
import * as TFU from 'fp-ts/function';

export const fpGetRoutePath = (argsFrom: { filename: string }) =>
  TFU.pipe(
    argsFrom,
    (args) => ({
      ...args,
      filename: args.filename.replace(/(.+)(\/|)(api|pages)(\/get\/|\/post\/|\/put\/|\/delete\/)(.+)(\.ts)/, '/$3/$5'),
    }),
    (args) => {
      const paramsApplied = removeStartsSlash(args.filename)
        .split('/')
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
        .filter((item): item is string => item !== undefined)
        .join('/');

      return { ...args, filename: `/${paramsApplied.replace('pages', '')}` };
    },
  );
