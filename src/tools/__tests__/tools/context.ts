import type { TRouteOption } from '#configs/interfaces/TRouteOption';
import type { TWatchOption } from '#configs/interfaces/TWatchOption';
import type { Project } from 'ts-morph';

export default class JestContext {
  #projectPath: string | undefined;

  #project: Project | undefined;

  #routeOption: TRouteOption | undefined;

  #watchOption: TWatchOption | undefined;

  get projectPath(): string {
    if (this.#projectPath == null) throw new Error('empty projectPath');
    return this.#projectPath;
  }

  set projectPath(value: string) {
    this.#projectPath = value;
  }

  get project(): Project {
    if (this.#project == null) throw new Error('empty project');
    return this.#project;
  }

  set project(value: Project) {
    this.#project = value;
  }

  get routeOption(): TRouteOption {
    if (this.#routeOption == null) throw new Error('empty route option');
    return this.#routeOption;
  }

  set routeOption(value: TRouteOption) {
    this.#routeOption = value;
  }

  get watchOption(): TWatchOption {
    if (this.#watchOption == null) throw new Error('empty watch option');
    return this.#watchOption;
  }

  set watchOption(value: TWatchOption) {
    this.#watchOption = value;
  }

  constructor() {
    this.#project = undefined;
  }
}
