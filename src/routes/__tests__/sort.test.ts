import type IRouteConfiguration from '#routes/interface/IRouteConfiguration';
import sortRoutePath from '#routes/sortRoutePath';
import sortRoutePaths from '#routes/sortRoutePaths';
import getData from '#tools/__tests__/getData';
import 'jest';
import * as mnf from 'my-node-fp';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('sortRoutePath', () => {
  test('empty', () => {
    const reply = sortRoutePath([]);
    expect(reply).toMatchObject([]);
  });

  test('pass', async () => {
    const inp = await getData<IRouteConfiguration[]>(__dirname, 'inp', 'T02-inp.json');
    const result = sortRoutePath(inp);
    const exp = await getData(__dirname, 'inp', 'T02-expect.json');
    expect(result).toEqual(exp);
  });

  test('exception', async () => {
    const spy = jest
      .spyOn(mnf, 'isDescendant')
      .mockImplementation((parentDirPath: string, targetDirPath: string, sep?: string) => {
        if (parentDirPath === '/justice/:dc-league/hello') {
          throw new Error('raise error');
        }

        return mnf.isDescendant(parentDirPath, targetDirPath, sep);
      });

    const inp = await getData<IRouteConfiguration[]>(__dirname, 'inp', 'T02-inp.json');
    const result = sortRoutePath(inp);
    const exp = await getData(__dirname, 'inp', 'T03-expect.json');

    spy.mockRestore();

    expect(result).toEqual(exp);
  });
});

describe('sortRoutePaths', () => {
  test('pass', async () => {
    const inp = await getData<IRouteConfiguration[]>(__dirname, 'inp', 'T01-inp.json');
    const results = sortRoutePaths(inp);

    const summary = results.map((result) => `${result.method}::${result.routePath}`);
    const exp = await getData(__dirname, 'inp', 'T01-expect.json');
    expect(summary).toEqual(exp);
  });
});
