import { getRouteMap } from '#/routes/extractors/getRouteMap';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const map = new Map<string, string>([['time', ':hour(^\\d{2})h:minute(^\\d{2})m']]);
const emptyMap = new Map<string, string>();

describe('getRouteMap', () => {
  it('successfully load map', async () => {
    const dirPath = path.join(process.cwd(), 'examples', 'handlers', 'avengers', 'heroes', '[id]', '$time');
    const filePath = path.join(dirPath, 'post.ts');
    const r01 = await getRouteMap(filePath);
    expect(r01).toMatchObject(map);
  });

  it('exception', async () => {
    const dirPath = path.join(process.cwd(), 'examples', 'handlers', 'avengers', 'heroes', '[id]', '$time');
    const filePath = path.join(dirPath, 'post333.ts333');
    const r01 = await getRouteMap(filePath);
    expect(r01).toMatchObject(emptyMap);
  });

  it('not map type', async () => {
    const dirPath = path.join(process.cwd(), 'examples', 'handlers', 'justice', '[dc-league]', 'hello');
    const filePath = path.join(dirPath, 'get.ts');
    const r01 = await getRouteMap(filePath);
    expect(r01).toMatchObject(emptyMap);
  });

  it('empty', async () => {
    const dirPath = path.join(process.cwd(), 'examples', 'handlers', 'justice', '[dc-league]', 'world');
    const filePath = path.join(dirPath, 'get.ts');
    const r01 = await getRouteMap(filePath);
    expect(r01).toMatchObject(emptyMap);
  });
});
