import fuzzyWithCase from '@tool/fuzzyWithCase';
import consola, { LogLevel } from 'consola';
import 'jest';

beforeAll(() => {
  consola.level = LogLevel.Debug;
});

test('fuzzy-test', () => {
  consola.debug('fuzzy-test start');

  const examples = ['querystring', 'query-string', 'queryString', 'query_string'];
  const result = examples.map((example) => fuzzyWithCase('Querystring', example));

  expect(result).toEqual([
    { rendered: 'querystring', score: Infinity, signature: 'Querystring', expectName: 'querystring', matchCase: false },
    { rendered: 'query-string', score: 177, signature: 'Querystring', expectName: 'query-string', matchCase: false },
    { rendered: 'queryString', score: Infinity, signature: 'Querystring', expectName: 'queryString', matchCase: false },
    { rendered: 'query_string', score: 177, signature: 'Querystring', expectName: 'query_string', matchCase: false },
  ]);
});
