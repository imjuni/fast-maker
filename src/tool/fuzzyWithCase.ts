/*
 * fuzzy를 간단하게 확장한 것. fuzzy에 options으로 caseSensitive를 전달하면 case가 다른 경우
 * 아예 매칭이 되지 않기 때문에 아래와 같이 caseSensitive는 false로 처리하되, case가 다른 경우
 * matchCase를 별도로 전달한다
 */
import fuzzy, { MatchResult } from 'fuzzy';
import { isEmpty } from 'my-easy-fp';

export interface IFuzzyWithCaseReturn extends MatchResult {
  matchCase: boolean;
  signature: string;
  expectName: string;
}

export default function fuzzyWithCase(source: string, target: string): IFuzzyWithCaseReturn {
  const fuzzinessResult = fuzzy.match(source, target);

  if (isEmpty(fuzzinessResult) || Object.keys(fuzzinessResult).length <= 0) {
    return {
      rendered: target,
      signature: source,
      expectName: target,
      score: -1,
      matchCase: source.localeCompare(target) === 0,
    };
  }

  return { ...fuzzinessResult, signature: source, expectName: target, matchCase: source.localeCompare(target) === 0 };
}
