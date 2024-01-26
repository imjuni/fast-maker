import { getExclude } from '#/modules/files/getExclude';
import { getFileScope } from '#/modules/files/getFileScope';
import { getInclude } from '#/modules/files/getInclude';
import { describe, expect, it } from 'vitest';

describe('getInclude', () => {
  it('undefined', () => {
    const r01 = getInclude();
    expect(r01).toMatchObject([]);
  });

  it('empty object', () => {
    const r01 = getInclude({});
    expect(r01).toMatchObject([]);
  });

  it('dont have', () => {
    const r01 = getInclude({ name: 'test' });
    expect(r01).toMatchObject([]);
  });

  it('number array', () => {
    const r01 = getInclude({ include: [1, 2] });
    expect(r01).toMatchObject([]);
  });

  it('mixed array', () => {
    const r01 = getInclude({ include: [1, 'a'] });
    expect(r01).toMatchObject([]);
  });

  it('string array', () => {
    const r01 = getInclude({ include: ['a'] });
    expect(r01).toMatchObject(['a']);
  });
});

describe('getExclude', () => {
  it('undefined', () => {
    const r01 = getExclude();
    expect(r01).toMatchObject([]);
  });

  it('empty object', () => {
    const r01 = getExclude({});
    expect(r01).toMatchObject([]);
  });

  it('dont have', () => {
    const r01 = getExclude({ name: 'test' });
    expect(r01).toMatchObject([]);
  });

  it('number array', () => {
    const r01 = getExclude({ exclude: [1, 2] });
    expect(r01).toMatchObject([]);
  });

  it('mixed array', () => {
    const r01 = getExclude({ exclude: [1, 'a'] });
    expect(r01).toMatchObject([]);
  });

  it('string array', () => {
    const r01 = getExclude({ exclude: ['a'] });
    expect(r01).toMatchObject(['a']);
  });
});

describe('getFileScope', () => {
  it('fine object', () => {
    const r01 = getFileScope({
      include: ['a'],
      exclude: ['b'],
    });

    expect(r01).toMatchObject({
      include: ['a'],
      exclude: ['b'],
    });
  });
});
