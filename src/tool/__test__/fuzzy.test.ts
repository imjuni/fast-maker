import validParamNames from '#compiler/validation/validParamNames';
import fuzzyWithCase from '#tool/fuzzyWithCase';
import consola, { LogLevel } from 'consola';
import 'jest';

beforeAll(() => {
  consola.level = LogLevel.Debug;
});

test('fuzzy-test', () => {
  consola.debug('fuzzy-test start');

  const examples = ['querystring', 'query-string', 'queryString', 'query_string', 'ironman'];
  const result = examples.map((example) => fuzzyWithCase(validParamNames.fastify, example)).flatMap((f) => f);

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
