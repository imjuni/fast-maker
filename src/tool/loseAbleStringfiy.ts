import fastSafeStringify from 'fast-safe-stringify';
import { Node } from 'ts-morph';

export default function loseAbleStringfiy<T>(obj: T): string {
  try {
    return fastSafeStringify(
      obj,
      (_key, value) => {
        if (value === '[Circular]') {
          return undefined;
        }

        if (value instanceof Node) {
          return undefined;
        }

        return value;
      },
      2,
    );
  } catch {
    return '{}';
  }
}
