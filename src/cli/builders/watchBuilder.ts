import type { TWatchOption } from '#/configs/interfaces/TWatchOption';
import type { Argv } from 'yargs';

export default function watchBuilder(argv: Argv) {
  argv.option('debounceTime', {
    description: 'watch file debounceTime. unit use milliseconds',
    type: 'number',
    default: 1000,
  });

  return argv as Argv<TWatchOption>;
}
