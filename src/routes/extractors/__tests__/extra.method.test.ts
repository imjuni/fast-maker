import { getExtraMethod } from '#/routes/extractors/getExtraMethod';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { getMethod } from '../getMethod';

const map = new Map<string, string>([['time', ':hour(^\\d{2})h:minute(^\\d{2})m']]);
const emptyMap = new Map<string, string>();

describe('getExtraMethod', () => {
  it('successfully load const variable method', async () => {
    const dirPath = path.join(process.cwd(), 'examples', 'handlers', 'avengers', 'heroes', '[[id]]');
    const filePath = path.join(dirPath, 'get.ts');
    const r01 = await getExtraMethod(filePath);
    expect(r01).toMatchObject(map);
  });

  it('successfully load array methods', async () => {
    const dirPath = path.join(process.cwd(), 'examples', 'handlers', 'avengers', 'heroes/[id]');
    const filePath = path.join(dirPath, 'put.ts');
    const r01 = await getExtraMethod(filePath);
    expect(r01).toMatchObject(map);
  });

  it('exception', async () => {
    const dirPath = path.join(process.cwd(), 'examples', 'handlers', 'avengers', 'heroes', '[id]', '$time');
    const filePath = path.join(dirPath, 'post333.ts333');
    const r01 = await getExtraMethod(filePath);
    expect(r01).toMatchObject(emptyMap);
  });

  it('not method', async () => {
    const dirPath = path.join(process.cwd(), 'examples', 'handlers', 'justice', '[dc-league]', 'hello');
    const filePath = path.join(dirPath, 'get.ts');
    const r01 = await getExtraMethod(filePath);
    expect(r01).toMatchObject(emptyMap);
  });

  it('empty', async () => {
    const dirPath = path.join(process.cwd(), 'examples', 'handlers', 'justice', '[dc-league]', 'world');
    const filePath = path.join(dirPath, 'get.ts');
    const r01 = await getExtraMethod(filePath);
    expect(r01).toMatchObject(emptyMap);
  });
});

describe('getMethod', () => {
  it('every methods', () => {
    const r01 = getMethod('/a/b/c/d/e/delete.ts');
    const r02 = getMethod('/a/b/c/d/e/get.ts');
    const r03 = getMethod('/a/b/c/d/e/head.ts');
    const r04 = getMethod('/a/b/c/d/e/patch.ts');
    const r05 = getMethod('/a/b/c/d/e/post.ts');
    const r06 = getMethod('/a/b/c/d/e/put.ts');
    const r07 = getMethod('/a/b/c/d/e/options.ts');
    const r08 = getMethod('/a/b/c/d/e/propfind.ts');
    const r09 = getMethod('/a/b/c/d/e/proppatch.ts');
    const r10 = getMethod('/a/b/c/d/e/mkcol.ts');
    const r11 = getMethod('/a/b/c/d/e/copy.ts');
    const r12 = getMethod('/a/b/c/d/e/move.ts');
    const r13 = getMethod('/a/b/c/d/e/lock.ts');
    const r14 = getMethod('/a/b/c/d/e/unlock.ts');
    const r15 = getMethod('/a/b/c/d/e/trace.ts');
    const r16 = getMethod('/a/b/c/d/e/search.ts');

    expect(r01).toEqual('delete');
    expect(r02).toEqual('get');
    expect(r03).toEqual('head');
    expect(r04).toEqual('patch');
    expect(r05).toEqual('post');
    expect(r06).toEqual('put');
    expect(r07).toEqual('options');
    expect(r08).toEqual('propfind');
    expect(r09).toEqual('proppatch');
    expect(r10).toEqual('mkcol');
    expect(r11).toEqual('copy');
    expect(r12).toEqual('move');
    expect(r13).toEqual('lock');
    expect(r14).toEqual('unlock');
    expect(r15).toEqual('trace');
    expect(r16).toEqual('search');
  });

  it('exceptions', () => {
    expect(() => {
      getMethod('/a/b/c/d/e/dEleTc.ts');
    }).toThrowError();
  });
});
