import type IReason from '#/compilers/interfaces/IReason';
import reasons from '#/modules/reasons';
import 'jest';
import { atOrThrow } from 'my-easy-fp';

describe('Reason Container', () => {
  test('add', async () => {
    reasons.add({ type: 'error', message: '', filePath: '' } satisfies IReason);
    const r = atOrThrow(reasons.reasons, 0);
    expect(r).toMatchObject({ type: 'error', message: '', filePath: '' });
  });

  test('clear', async () => {
    reasons.add({ type: 'error', message: '', filePath: '' } satisfies IReason);
    reasons.clear();
    expect(reasons.reasons.length).toEqual(0);
  });
});
