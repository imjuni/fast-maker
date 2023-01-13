import type IReason from '#compiler/interface/IReason';

export default class ErrorWithMessage extends Error {
  private inReason: IReason;

  constructor(message: string, reason: IReason) {
    super(message);

    this.inReason = reason;
  }

  get reason(): IReason {
    return this.inReason;
  }
}
