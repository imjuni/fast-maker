import { getExcludePatterns } from '#/modules/files/getExcludePatterns';
import { getIncludePatterns } from '#/modules/files/getIncludePatterns';
import { describe, expect, it } from 'vitest';

describe('getIncludePatterns', () => {
  it('include from options', () => {
    const r01 = getIncludePatterns({ include: ['a'] }, { raw: {}, fileNames: [] }, '');
    expect(r01).toMatchObject(['a']);
  });

  it('include from tsconfig', () => {
    const r01 = getIncludePatterns({ include: [] }, { raw: { include: ['a'] }, fileNames: [] }, '');
    expect(r01).toMatchObject(['a']);
  });

  it('include from tsconfig', () => {
    const r01 = getIncludePatterns({ include: [] }, { raw: { include: [] }, fileNames: ['a/c', 'a/b'] }, 'a');
    expect(r01).toMatchObject(['a/c', 'a/b']);
  });
});

describe('getExcludePatterns', () => {
  it('exclude from options', () => {
    const r01 = getExcludePatterns({ exclude: ['a'] }, { raw: {}, fileNames: [] });
    expect(r01).toMatchObject(['a']);
  });

  it('exclude from tsconfig', () => {
    const r01 = getExcludePatterns({ exclude: [] }, { raw: { exclude: ['a'] }, fileNames: [] });
    expect(r01).toMatchObject(['a']);
  });
});
