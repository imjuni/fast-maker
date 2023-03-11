import getResolvedPaths from '#configs/getResolvedPaths';
import 'jest';
import path from 'path';

const originPath = process.env.INIT_CWD!;

beforeEach(() => {
  process.env.USE_INIT_CWD = 'true';
  process.env.INIT_CWD = path.join(originPath, 'examples');
});

describe('getResolvedPaths', () => {
  test('normal', async () => {
    const r = getResolvedPaths({
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      handler: path.join(originPath, 'examples', 'handlers'),
      output: path.join(originPath, 'examples'),
    });

    expect(r).toMatchObject({
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      handler: path.join(originPath, 'examples', 'handlers'),
      output: path.join(originPath, 'examples'),
      cwd: path.join(originPath, 'examples'),
    });
  });

  test('no output', async () => {
    const r = getResolvedPaths({
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      handler: path.join(originPath, 'examples', 'handlers'),
    });

    expect(r).toMatchObject({
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      handler: path.join(originPath, 'examples', 'handlers'),
      output: path.join(originPath, 'examples', 'handlers'),
      cwd: path.join(originPath, 'examples'),
    });
  });

  test('relative path', async () => {
    const r = getResolvedPaths({
      project: './tsconfig.json',
      handler: './handlers',
      output: '.',
    });

    expect(r).toMatchObject({
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      handler: path.join(originPath, 'examples', 'handlers'),
      output: path.join(originPath, 'examples'),
      cwd: path.join(originPath, 'examples'),
    });
  });

  test('relative path', async () => {
    const r = getResolvedPaths({
      project: './tsconfig.json',
      handler: './handlers',
    });

    expect(r).toMatchObject({
      project: path.join(originPath, 'examples', 'tsconfig.json'),
      handler: path.join(originPath, 'examples', 'handlers'),
      output: path.join(originPath, 'examples', 'handlers'),
      cwd: path.join(originPath, 'examples'),
    });
  });
});
