import fastSafeStringify from 'fast-safe-stringify';
import * as tsm from 'ts-morph';

export default function getTestValue<T>(testData: T) {
  const stringifiedString = fastSafeStringify(
    testData,
    (_key, value) => {
      if (value === '[Circular]') {
        return undefined;
      }

      if (value instanceof tsm.Node) {
        return undefined;
      }

      return value as unknown;
    },
    2,
  );

  return JSON.parse(stringifiedString) as T;
}
