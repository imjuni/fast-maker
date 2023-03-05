import getResolvePath from '#configs/getResolvePath';

function getConfigValue(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  // this literal raise error on existSync function
  return undefined;
}

export default function isValidConfig(argv: { [argName: string]: unknown; _: (string | number)[]; $0: string }) {
  // check project file exits
  const handler = getConfigValue(argv.handler) ?? '';
  const project = getConfigValue(argv.project) ?? '';

  if (getResolvePath(handler) === false) {
    throw new Error(`Invalid handler path: ${handler}`);
  }

  if (getResolvePath(project) === false) {
    throw new Error(`Invalid project path: ${project}`);
  }

  return true;
}
