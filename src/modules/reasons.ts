import type IReason from '#compilers/interfaces/IReason';

class ReasonBox {
  #reasons: IReason[];

  get reasons() {
    return this.#reasons;
  }

  constructor() {
    this.#reasons = [];
  }

  add(...reasons: IReason[]) {
    this.#reasons.push(...reasons);
  }

  clear() {
    this.#reasons = [];
  }
}

const reasons = new ReasonBox();

export default reasons;
