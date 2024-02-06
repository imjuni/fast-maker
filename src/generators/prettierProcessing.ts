import { getCwd } from '#/modules/files/getCwd';
import prettier, { type Options } from 'prettier';

export interface IPrettierProcessingParam {
  code: string;
  optionPath?: string;
}

export async function prettierProcessing({ code, optionPath }: IPrettierProcessingParam): Promise<string> {
  const userOption = await prettier.resolveConfig(optionPath ?? getCwd(process.env), { editorconfig: true });

  const option: Options =
    userOption == null
      ? {
          singleQuote: true,
          trailingComma: 'all',
          printWidth: 80,
          arrowParens: 'always',
          parser: 'typescript',
          plugins: ['prettier-plugin-organize-imports'],
        }
      : { ...userOption, parser: userOption.parser ?? 'typescript', plugins: ['prettier-plugin-organize-imports'] };

  const prettfied = prettier.format(code, option);

  return prettfied;
}
