import logger from '#tools/logger';
import { isError } from 'my-easy-fp';

const log = logger();

export default function errorTrace(caught: unknown) {
  const err = isError(caught, new Error('unknown error raised'));
  log.trace(err.message);
  log.trace(err.stack);
}
