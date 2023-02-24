import validParamNames from '#compilers/validators/validParamNames';
import fuzzyWithCase from '#tools/fuzzyWithCase';
import logger from '#tools/logging/logger';
import 'jest';

const log = logger();

test('fuzzy-test', () => {
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
