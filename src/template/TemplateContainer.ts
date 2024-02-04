import type { TRouteOption } from '#/configs/interfaces/TRouteOption';
import { getGlobFiles } from '#/modules/files/getGlobFiles';
import { defaultExclude } from '#/modules/scopes/defaultExclude';
import { getTemplatePath } from '#/template/getTemplatePath';
import consola from 'consola';
import { Eta } from 'eta';
import { Glob, type GlobOptions } from 'glob';
import { isError, isTrue, orThrow } from 'my-easy-fp';
import { basenames, exists, getDirname } from 'my-node-fp';
import fs from 'node:fs';
import path from 'node:path';

export class TemplateContainer {
  static #isBootstrap = false;

  static #it: TemplateContainer;

  static async #load(options: Partial<Pick<TRouteOption, 'templates'>>, globOptions: GlobOptions) {
    const resolvedTemplatePath = await getTemplatePath(options.templates);
    const globs = new Glob(path.posix.join(resolvedTemplatePath, `**`, '*.eta'), {
      ...globOptions,
      absolute: true,
      ignore: defaultExclude,
      cwd: resolvedTemplatePath,
      windowsPathsNoEscape: true,
    });
    const templateFilePaths = getGlobFiles(globs)
      .map((filePath): [string, boolean] => [filePath, true])
      .map(([filePath, _flag]) => filePath);

    const loadedTemplateFiles = (
      await Promise.all(
        templateFilePaths.map(async (templateFilePath) => {
          if (isTrue(await exists(templateFilePath))) {
            const buf = await fs.promises.readFile(templateFilePath);
            const relative = path.relative(resolvedTemplatePath, templateFilePath).replace(`.${path.posix.sep}`, '');
            const dirname = await getDirname(relative);
            const basename = basenames(relative, ['.eta', '.ejs']);

            return { key: path.join(dirname, basename), content: buf.toString() };
          }

          return undefined;
        }),
      )
    ).filter((template): template is { key: string; content: string } => template != null);

    const templates = loadedTemplateFiles.reduce<Record<string, string>>((aggregation, template) => {
      return { ...aggregation, [template.key]: template.content };
    }, {});

    return templates;
  }

  static async bootstrap(options?: Partial<Pick<TRouteOption, 'templates'>>): Promise<void> {
    try {
      if (TemplateContainer.#isBootstrap) {
        return;
      }

      const templates = await TemplateContainer.#load(options ?? {}, {});
      TemplateContainer.#it = new TemplateContainer(templates);
    } finally {
      TemplateContainer.#isBootstrap = true;
    }
  }

  static get it(): Readonly<TemplateContainer> {
    return TemplateContainer.#it;
  }

  #eta: Eta;

  #templates: Record<string, string>;

  constructor(templates: Record<string, string>) {
    this.#templates = templates;

    this.#eta = new Eta({ views: 'fast-maker', autoEscape: false });
    this.#eta.resolvePath = (templatePath: string) => templatePath;
    this.#eta.readFile = (templatePath: string) => {
      return orThrow(this.#templates[templatePath], new Error('cannot found template'));
    };
  }

  async evaluate<T extends object>(name: string, data: T) {
    try {
      const rendered = this.#eta.render(name, data);
      return rendered;
    } catch (caught) {
      const err = isError(caught, new Error('raise error from evaluateTemplate'));
      consola.error(`template: ${name}`, data);
      consola.error(err);
      throw err;
    }
  }
}
