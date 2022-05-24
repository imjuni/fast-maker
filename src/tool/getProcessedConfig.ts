import extractor from '@cli/extractor';
import { IFastMakerYargsParameter } from '@cli/IFastMakerYargsParameter';
import { IOption } from '@module/IOption';
import consola from 'consola';
import { fail, pass, PassFailEither } from 'my-only-either';
import { Arguments } from 'yargs';

interface IProcessConfigParam {
  args: Arguments<IFastMakerYargsParameter>;
  project: string;
}

export default async function getProcessedConfig({
  args,
  project,
}: IProcessConfigParam): Promise<PassFailEither<Error, IOption>> {
  try {
    const optionFromCliParameter = extractor(args);
    const option = { ...optionFromCliParameter, project };

    return pass(option);
  } catch (catched) {
    const err = catched instanceof Error ? catched : new Error('unknown error raised');
    consola.error(err);

    return fail(err);
  }
}
