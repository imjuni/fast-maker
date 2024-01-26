import { CE_ROUTE_METHOD } from '#/routes/const-enum/CE_ROUTE_METHOD';
import type chalk from 'chalk';

function getMethodColor(method: CE_ROUTE_METHOD, type: 'background'): typeof chalk.BackgroundColor;
function getMethodColor(method: CE_ROUTE_METHOD, type: 'foreground'): typeof chalk.ForegroundColor;
function getMethodColor(
  method: CE_ROUTE_METHOD,
  type: 'foreground' | 'background',
): typeof chalk.BackgroundColor | typeof chalk.ForegroundColor {
  if (method === CE_ROUTE_METHOD.GET) {
    return type === 'background' ? 'bgBlue' : 'blueBright';
  }

  if (method === CE_ROUTE_METHOD.POST) {
    return type === 'background' ? 'bgGreen' : 'greenBright';
  }

  if (method === CE_ROUTE_METHOD.PUT) {
    return type === 'background' ? 'bgYellow' : 'yellow';
  }

  if (method === CE_ROUTE_METHOD.DELETE) {
    return type === 'background' ? 'bgRed' : 'red';
  }

  if (method === CE_ROUTE_METHOD.PATCH) {
    return type === 'background' ? 'bgMagenta' : 'magenta';
  }

  if (method === CE_ROUTE_METHOD.OPTIONS) {
    return type === 'background' ? 'bgMagenta' : 'magenta';
  }

  if (method === CE_ROUTE_METHOD.HEAD) {
    return type === 'background' ? 'bgMagenta' : 'magenta';
  }

  return type === 'background' ? 'bgMagenta' : 'magenta';
}

export default getMethodColor;
