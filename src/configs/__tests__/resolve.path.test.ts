import { getResolvedPaths } from '#/configs/getResolvedPaths';
import path from 'path';
import { beforeAll, describe, expect, it } from 'vitest';

describe('getResolvedPaths', () => {
  beforeAll(() => {
    process.env.USE_INIT_CWD = 'true';
    process.env.INIT_CWD = path.join(process.cwd(), 'examples');
  });

  it('with output', async () => {
    const r = await getResolvedPaths({
      project: `.${path.posix.sep}${path.join('examples', 'tsconfig.json')}`,
      handler: `.${path.posix.sep}${path.join('examples', 'handlers')}`,
      output: `.${path.posix.sep}output`,
    });

    expect(r).toMatchObject({
      project: path.join(process.cwd(), 'examples', 'tsconfig.json'),
      handler: path.join(process.cwd(), 'examples', 'handlers'),
      output: path.join(process.cwd(), 'examples', 'output'),
      cwd: path.join(process.cwd(), 'examples'),
    });
  });

  it('without output', async () => {
    const r = await getResolvedPaths({
      project: `.${path.posix.sep}${path.join('examples', 'tsconfig.json')}`,
      handler: `.${path.posix.sep}${path.join('examples', 'handlers')}`,
    });

    expect(r).toMatchObject({
      project: path.join(process.cwd(), 'examples', 'tsconfig.json'),
      handler: path.join(process.cwd(), 'examples', 'handlers'),
      output: path.join(process.cwd(), 'examples', 'handlers'),
      cwd: path.join(process.cwd(), 'examples'),
    });
  });
});
