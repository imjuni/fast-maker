/*
 * fuzzy를 간단하게 확장한 것. fuzzy에 options으로 caseSensitive를 전달하면 case가 다른 경우
 * 아예 매칭이 되지 않기 때문에 아래와 같이 caseSensitive는 false로 처리하되, case가 다른 경우
 * matchCase를 별도로 전달한다
 */
import Fuse from 'fuse.js';
import { bignumber } from 'mathjs';

export interface IFuzzyWithCaseReturn {
  target: string;
  origin: string;
  score: number;
  percent: number;
  matchCase: boolean;
  expectName: string;
}

export default function fuzzyWithCase(sources: string | string[], target: string): IFuzzyWithCaseReturn[] {
  const fuse = new Fuse(Array.isArray(sources) ? sources : [sources], { includeScore: true });
  const fuzzinesses = fuse.search(target);

  const fuzzyWithCases = fuzzinesses.map<IFuzzyWithCaseReturn>((fuzzinessResult) => ({
    target,
    origin: fuzzinessResult.item,
    expectName: fuzzinessResult.item,

    score: bignumber(fuzzinessResult.score ?? 0)
      .mul(1000)
      .floor()
      .div(1000)
      .toNumber(),

    percent: bignumber(1)
      .sub(fuzzinessResult.score ?? 0)
      .div(1)
      .mul(100)
      .mul(1000)
      .floor()
      .div(1000)
      .toNumber(),

    matchCase: fuzzinessResult.item.localeCompare(target) === 0,
  }));

  return fuzzyWithCases;
}
