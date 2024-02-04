import { CE_ROUTE_INFO_KIND } from '#/routes/const-enum/CE_ROUTE_INFO_KIND';
import { getRoutePath } from '#/routes/paths/getRoutePath';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('getRoutePath', () => {
  it('single variable', async () => {
    const r01 = await getRoutePath(path.posix.join('avengers', 'heros', '[id]', 'hero', 'get.ts'));
    expect(r01).toMatchObject({
      kind: CE_ROUTE_INFO_KIND.ROUTE_PATH_SUMMARY,
      filePath: 'avengers/heros/[id]/hero/get.ts',
      method: 'get',
      routePath: '/avengers/heros/:id/hero',
    });
  });

  it('multiple variable', async () => {
    const r01 = await getRoutePath(
      path.posix.join('avengers', '[heros]', 'power', '[name]-[kind]-[id]', 'hero', 'post.ts'),
    );

    expect(r01).toMatchObject({
      kind: CE_ROUTE_INFO_KIND.ROUTE_PATH_SUMMARY,
      filePath: 'avengers/[heros]/power/[name]-[kind]-[id]/hero/post.ts',
      method: 'post',
      routePath: '/avengers/:heros/power/:name-:kind-:id/hero',
    });
  });

  it('multiple variable with nullable variable', async () => {
    const r01 = await getRoutePath(
      path.posix.join('avengers', '[heros]', 'power', '[name]-[kind]-[id]', 'hero', '[[name]]', 'get.ts'),
    );

    expect(r01).toMatchObject({
      kind: CE_ROUTE_INFO_KIND.ROUTE_PATH_SUMMARY,
      filePath: 'avengers/[heros]/power/[name]-[kind]-[id]/hero/[[name]]/get.ts',
      method: 'get',
      routePath: '/avengers/:heros/power/:name-:kind-:id/hero/:name?',
    });
  });

  it('wildcard variable with nullable variable', async () => {
    const r01 = await getRoutePath(path.posix.join('po-ke', '[...kind]', 'age', '[[name]]', 'get.ts'));

    expect(r01).toMatchObject({
      kind: CE_ROUTE_INFO_KIND.ROUTE_PATH_SUMMARY,
      filePath: 'po-ke/[...kind]/age/[[name]]/get.ts',
      method: 'get',
      routePath: '/po-ke/*/age/:name?',
    });
  });
});
