import { bignumber } from 'mathjs';

export function getNumber(num?: number): number {
  return bignumber(num ?? 0)
    .mul(1000)
    .floor()
    .div(1000)
    .toNumber();
}

export function getPercentNumber(num?: number): number {
  if (num == null) {
    return 0;
  }

  return bignumber(1).sub(num).div(1).mul(100).mul(1000).floor().div(1000).toNumber();
}
