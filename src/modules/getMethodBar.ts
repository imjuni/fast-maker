import type { CE_ROUTE_METHOD } from '#/routes/const-enum/CE_ROUTE_METHOD';

const max = 11;

export function getMethodBar(method: CE_ROUTE_METHOD): string {
  return `${method}`
    .toUpperCase()
    .padStart((max + method.length + 1) / 2)
    .padEnd(max);
}
