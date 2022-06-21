import { fail, pass, PassFailEither } from 'my-only-either';
import prettier, { Options } from 'prettier';

export interface IPrettierProcessingParam {
  code: string;
  optionPath?: string;
}

export default async function prettierProcessing({
  code,
  optionPath,
}: IPrettierProcessingParam): Promise<PassFailEither<Error, string>> {
  try {
    const rawOption = await prettier.resolveConfig(optionPath ?? process.cwd(), { editorconfig: true });

    const option: Options =
      rawOption === null
        ? {
            singleQuote: true,
            trailingComma: 'all',
            printWidth: 80,
            arrowParens: 'always',
            parser: 'typescript',
          }
        : { ...rawOption, parser: rawOption.parser ?? 'typescript' };

    const prettfied = prettier.format(code, option);

    return pass(prettfied);
  } catch (catched) {
    const err = catched instanceof Error ? catched : new Error('unknown error raised');
    return fail(err);
  }
}
