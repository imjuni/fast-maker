import { validParamNames } from '#/compilers/validators/validParamNames';
import { fuzzyWithCase } from '#/tools/fuzzyWithCase';
import { getNumber, getPercentNumber } from '#/tools/getNumber';
import log from 'consola';
import { describe, expect, it } from 'vitest';

describe('fuzzyWithCase', () => {
  it('pass - number', () => {
    const r = getNumber(0.13456123);
    expect(r).toEqual(0.134);
  });

  it('pass - percent', () => {
    const r = getPercentNumber(0.13456123);
    expect(r).toEqual(86.543);
  });

  it('pass - number undefined', () => {
    const r = getNumber();
    expect(r).toEqual(0);
  });

  it('pass - percent undefined', () => {
    const r = getPercentNumber();
    expect(r).toEqual(0);
  });
});

describe('fuzzyWithCase', () => {
  it('pass', () => {
    log.debug('fuzzy-test start');

    const examples = ['querystring', 'query-string', 'queryString', 'query_string', 'ironman'];
    const result = examples.map((example) => fuzzyWithCase(validParamNames.fastify, example)).flat();

    expect(result).toEqual([
      {
        target: 'querystring',
        origin: 'Querystring',
        expectName: 'Querystring',
        score: 0,
        percent: 100,
        matchCase: false,
      },
      {
        target: 'query-string',
        origin: 'Querystring',
        expectName: 'Querystring',
        score: 0.083,
        percent: 91.666,
        matchCase: false,
      },
      {
        target: 'queryString',
        origin: 'Querystring',
        expectName: 'Querystring',
        score: 0,
        percent: 100,
        matchCase: false,
      },
      {
        target: 'query_string',
        origin: 'Querystring',
        expectName: 'Querystring',
        score: 0.083,
        percent: 91.666,
        matchCase: false,
      },
    ]);
  });

  it('pass', () => {
    log.debug('fuzzy-test start');

    const example = 'Querystring';
    const r = fuzzyWithCase(example, 'quer');
    expect(r).toMatchObject([
      {
        target: 'quer',
        origin: 'Querystring',
        expectName: 'Querystring',
        score: 0.001,
        percent: 99.9,
        matchCase: false,
      },
    ]);
  });
});
