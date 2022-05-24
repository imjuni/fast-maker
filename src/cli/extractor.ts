import { IOption } from '@module/IOption';
import { Arguments } from 'yargs';
import { IFastMakerYargsParameter } from './IFastMakerYargsParameter';

export default function extractor(args: Arguments<IFastMakerYargsParameter>): IOption {
  const option: IOption = {
    project: args.project,
    verbose: args.verbose,
    debugLog: args.debugLog,

    path: {
      handler: args.handler,
      output: args.output ?? args.handler,
    },
  };

  return option;
}
