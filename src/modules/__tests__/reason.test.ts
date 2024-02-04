import type { IReason } from '#/compilers/interfaces/IReason';
import { ReasonContainer } from '#/modules/ReasonContainer';
import { atOrThrow } from 'my-easy-fp';
import { beforeAll, describe, expect, it } from 'vitest';

describe('Reason Container', () => {
  beforeAll(() => {
    ReasonContainer.bootstrap();
  });

  it('add', async () => {
    ReasonContainer.it.add({ type: 'error', message: '', filePath: '' } satisfies IReason);
    const r = atOrThrow(ReasonContainer.it.reasons, 0);
    expect(r).toMatchObject({ type: 'error', message: '', filePath: '' });
  });

  it('clear', async () => {
    ReasonContainer.it.add({ type: 'error', message: '', filePath: '' } satisfies IReason);
    ReasonContainer.it.clear();
    expect(ReasonContainer.it.reasons.length).toEqual(0);
  });
});
