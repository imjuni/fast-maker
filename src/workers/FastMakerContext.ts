import type { TRouteOption } from '#configs/interfaces/TRouteOption';
import type { TWatchOption } from '#configs/interfaces/TWatchOption';
import type { CE_ROUTE_INFO_KIND } from '#routes/interface/CE_ROUTE_INFO_KIND';
import type TRouteInfo from '#routes/interface/TRouteInfo';
import type { TPickRouteInfo } from '#routes/interface/TRouteInfo';
import type { Project } from 'ts-morph';

export default class FastMakerContext {
  #project: Project | undefined;

  #option: { kind: 'route'; option: TRouteOption } | { kind: 'watch'; option: TWatchOption } | undefined;

  #handler: TRouteInfo | undefined;

  get project(): Project {
    if (this.#project == null) throw new Error('Empty project in fast-maker-context');
    return this.#project;
  }

  set project(value) {
    this.#project = value;
  }

  get option(): TRouteOption | TWatchOption {
    if (this.#option == null) throw new Error('Empty routeOption in fast-maker-context');

    if (this.#option.kind === 'route') {
      return this.#option.option;
    }

    return this.#option.option;
  }

  setOption(value: { kind: 'route'; option: TRouteOption } | { kind: 'watch'; option: TWatchOption }) {
    this.#option = value;
  }

  set handler(value: TRouteInfo) {
    this.#handler = value;
  }

  getHandler(
    kind: typeof CE_ROUTE_INFO_KIND.VALIDATE_ROUTE_HANDLER_FILE,
  ): TPickRouteInfo<typeof CE_ROUTE_INFO_KIND.VALIDATE_ROUTE_HANDLER_FILE>;
  getHandler(
    kind: typeof CE_ROUTE_INFO_KIND.SUMMARY_ROUTE_HANDLER_FILE,
  ): TPickRouteInfo<typeof CE_ROUTE_INFO_KIND.SUMMARY_ROUTE_HANDLER_FILE>;
  getHandler(kind: CE_ROUTE_INFO_KIND) {
    if (this.#handler != null && kind === this.#handler.kind) {
      return this.#handler;
    }

    throw new Error(`Empty route-info: ${kind}`);
  }
}
