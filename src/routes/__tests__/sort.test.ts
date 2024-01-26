import type IRouteConfiguration from '#/routes/interfaces/IRouteConfiguration';
import sortRoutePath from '#/routes/sortRoutePath';
import sortRoutePaths from '#/routes/sortRoutePaths';
import { loadJsonData } from '@maeum/test-utility';
import 'jest';
import * as mnf from 'my-node-fp';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('sortRoutePaths', () => {
  test('pass', async () => {
    const inp = await loadJsonData<IRouteConfiguration[]>(__dirname, 'expects', 'T01-inp.json');
    const results = sortRoutePaths(inp);

    const summary = results.map((result) => `${result.method}::${result.routePath}`);
    const exp = await loadJsonData(__dirname, 'expects', 'T01-expect.json');
    expect(summary).toEqual(exp);
  });
});

describe('sortRoutePath', () => {
  test('empty', () => {
    const reply = sortRoutePath([]);
    expect(reply).toMatchObject([]);
  });

  test('pass', async () => {
    const inp = await loadJsonData<IRouteConfiguration[]>(__dirname, 'expects', 'T02-inp.json');
    const result = sortRoutePath(inp);
    const exp = await loadJsonData(__dirname, 'expects', 'T02-expect.json');
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

    const inp = await loadJsonData<IRouteConfiguration[]>(__dirname, 'expects', 'T02-inp.json');
    const result = sortRoutePath(inp);
    const exp = await loadJsonData(__dirname, 'expects', 'T03-expect.json');

    spy.mockRestore();

    expect(result).toEqual(exp);
  });
});
