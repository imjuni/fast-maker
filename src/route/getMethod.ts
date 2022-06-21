import TMethodType from '@route/interface/TMethodType';
import { fail, pass, PassFailEither } from 'my-only-either';

export default function getMethod(method: string): PassFailEither<Error, TMethodType> {
  const toLoweredMethod = method.toLowerCase();

  if (
    toLoweredMethod === 'get' ||
    toLoweredMethod === 'post' ||
    toLoweredMethod === 'put' ||
    toLoweredMethod === 'delete' ||
    toLoweredMethod === 'head' ||
    toLoweredMethod === 'options' ||
    toLoweredMethod === 'patch' ||
    toLoweredMethod === 'all'
  ) {
    return pass(toLoweredMethod);
  }

  return fail(new Error(`Invalid method type: ${method}`));
}
