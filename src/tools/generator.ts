import * as TEI from 'fp-ts/Either';
import * as TFU from 'fp-ts/function';
import { isEmpty } from 'my-easy-fp';

export const removeBracket = (filenameFrom: string): string =>
  TFU.pipe(
    TEI.tryCatch(
      () =>
        TFU.pipe(filenameFrom, (filename: string): string => {
          const matched = /(\\[|)([0-9a-zA-Z]+)(\\]|)/.exec(filename);
          if (isEmpty(matched)) {
            return filename;
          }

          const [_all, _start, vanillaFilename] = matched;
          return vanillaFilename ?? '';
        }),
      () => filenameFrom,
    ),
    TEI.fold(
      (fliename) => fliename,
      (fliename) => fliename,
    ),
  );

export const getOptionsVariableName = (args: { filename: string; hash: string }) => `options_${args.hash}`;

export const getDefaultVariableName = (args: { filename: string; hash: string }) => `default_${args.hash}`;
