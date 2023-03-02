import getCwd from '#tools/getCwd';
import prettier, { type Options } from 'prettier';

export interface IPrettierProcessingParam {
  code: string;
  optionPath?: string;
}

export default async function prettierProcessing({ code, optionPath }: IPrettierProcessingParam): Promise<string> {
  const userOption = await prettier.resolveConfig(optionPath ?? getCwd(process.env), { editorconfig: true });

  const option: Options =
    userOption == null
      ? {
          singleQuote: true,
          trailingComma: 'all',
          printWidth: 80,
          arrowParens: 'always',
          parser: 'typescript',
        }
      : { ...userOption, parser: userOption.parser ?? 'typescript' };

  const prettfied = prettier.format(code, option);

  return prettfied;
}
