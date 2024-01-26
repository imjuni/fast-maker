import { CE_ROUTE_INFO_KIND } from '#/routes/const-enum/CE_ROUTE_INFO_KIND';
import { summaryRoutePath } from '#/routes/summaryRoutePath';
import { summaryRoutePaths } from '#/routes/summaryRoutePaths';
import { describe, expect, it } from 'vitest';

describe('summaryRoutePath', () => {
  it('plain route path', async () => {
    const r01 = await summaryRoutePath('/a/b/c/get.ts', '/a/b');

    expect(r01).toMatchObject({
      kind: 'route',
      filePath: '/a/b/c/get.ts',
      map: new Map<string, string>(),
      method: 'get',
      routePath: '/c',
    });
  });
});

describe('summaryRoutePath', () => {
  it('plain route path', async () => {
    const emptyMap = new Map<string, string>();
    const r01 = await summaryRoutePaths(
      [
        '/a/b/c/get.ts',
        '/a/b/c/[[d]]/get.ts',
        '/a/b/c/d/e/get.ts',
        '/a/b/c/[f]/get.ts',
        '/a/b/c/g/get.ts',
        '/a/b/c/h/[...i]/get.ts',
        '/a/b/c/[[j]]/get.ts',
        '/a/b/c/[k]/all.ts',
      ],
      '/a/b',
    );

    // console.log(JSON.stringify(Array.from(r01.summary.entries()), undefined, 2));

    expect(r01).toMatchObject({
      kind: CE_ROUTE_INFO_KIND.ROUTE_PATH_SUMMARIES,
      summary: new Map([
        [
          '/c',
          [
            {
              kind: 'route',
              filePath: '/a/b/c/get.ts',
              map: emptyMap,
              method: 'get',
              routePath: '/c',
            },
          ],
        ],
        [
          '/c/:d?',
          [
            {
              kind: 'route',
              filePath: '/a/b/c/[[d]]/get.ts',
              map: emptyMap,
              method: 'get',
              routePath: '/c/:d?',
            },
          ],
        ],
        [
          '/c/d/e',
          [
            {
              kind: 'route',
              filePath: '/a/b/c/d/e/get.ts',
              map: emptyMap,
              method: 'get',
              routePath: '/c/d/e',
            },
          ],
        ],
        [
          '/c/:f',
          [
            {
              kind: 'route',
              filePath: '/a/b/c/[f]/get.ts',
              map: emptyMap,
              method: 'get',
              routePath: '/c/:f',
            },
          ],
        ],
        [
          '/c/g',
          [
            {
              kind: 'route',
              filePath: '/a/b/c/g/get.ts',
              map: emptyMap,
              method: 'get',
              routePath: '/c/g',
            },
          ],
        ],
        [
          '/c/h/*',
          [
            {
              kind: 'route',
              filePath: '/a/b/c/h/[...i]/get.ts',
              map: emptyMap,
              method: 'get',
              routePath: '/c/h/*',
            },
          ],
        ],
        [
          '/c/:j?',
          [
            {
              kind: 'route',
              filePath: '/a/b/c/[[j]]/get.ts',
              map: emptyMap,
              method: 'get',
              routePath: '/c/:j?',
            },
          ],
        ],
        [
          '/c/:k',
          [
            {
              kind: 'route',
              filePath: '/a/b/c/[k]/all.ts',
              map: emptyMap,
              method: 'all',
              routePath: '/c/:k',
            },
          ],
        ],
      ]),
    });
  });
});
