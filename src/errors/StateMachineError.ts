import type IReason from '#/compilers/interfaces/IReason';
import type IRouteHandler from '#/routes/interfaces/IRouteHandler';

export default class StateMachineError extends Error {
  accessor handler: IRouteHandler;

  accessor reason: IReason;

  constructor(handler: IRouteHandler, reason: IReason, message: string, stack?: string) {
    super(message);

    this.handler = handler;
    this.reason = reason;
    this.stack = stack;
  }
}
