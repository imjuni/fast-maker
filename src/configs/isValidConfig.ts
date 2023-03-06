import { CE_COMMAND_LIST } from '#cli/interfaces/CE_COMMAND_LIST';
import getResolvePath from '#configs/getResolvePath';
import { atOrUndefined } from 'my-easy-fp';

const commands: string[] = [
  CE_COMMAND_LIST.ROUTE,
  CE_COMMAND_LIST.ROUTE_ALIAS,
  CE_COMMAND_LIST.WATCH,
  CE_COMMAND_LIST.WATCH_ALIAS,
  CE_COMMAND_LIST.INIT,
  CE_COMMAND_LIST.INIT_ALIAS,
];

function getConfigValue(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  // this literal raise error on existSync function
  return undefined;
}

export default function isValidConfig(argv: { [argName: string]: unknown; _: (string | number)[]; $0: string }) {
  const command = atOrUndefined(argv._, 0);

  if (commands.includes(`${command ?? ''}`) === false) {
    throw new Error(`"${command ?? ''}" is invalid command`);
  }

  if (command === CE_COMMAND_LIST.INIT || command === CE_COMMAND_LIST.INIT_ALIAS) {
    return true;
  }

  // check project file exits
  const handler = getConfigValue(argv.handler);
  const project = getConfigValue(argv.project);

  if (handler == null || getResolvePath(handler) === false) {
    throw new Error(`Invalid handler path: ${handler ?? 'undefined'}`);
  }

  if (project == null || getResolvePath(project) === false) {
    throw new Error(`Invalid project path: ${project ?? 'undefined'}`);
  }

  return true;
}
