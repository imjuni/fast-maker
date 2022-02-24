import * as TEI from 'fp-ts/Either';
import * as TTE from 'fp-ts/TaskEither';

export type TResolvedEither<T extends TEI.Either<any, any>> = [T] extends [TEI.Either<any, infer U>] ? U : never;

export function taskEitherLiftor<X, Y, Z>(f: (args: X) => Promise<TEI.Either<Y, Z>>) {
  return (args: X): TTE.TaskEither<Y, Z> =>
    () =>
      f(args);
}
