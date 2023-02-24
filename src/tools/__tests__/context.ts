import type { Project } from 'ts-morph';

export default class JestContext {
  #project: Project | undefined;

  get project(): Project {
    if (this.#project == null) throw new Error('empty project');
    return this.#project;
  }

  set project(value: Project) {
    this.#project = value;
  }

  constructor() {
    this.#project = undefined;
  }
}
