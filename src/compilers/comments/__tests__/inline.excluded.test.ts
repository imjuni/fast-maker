import { getInlineExcludedFiles } from '#/compilers/comments/getInlineExcludedFiles';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import * as tsm from 'ts-morph';
import { describe, expect, it } from 'vitest';

const tsconfigDirPath = path.join(process.cwd(), 'examples');
const tsconfigFilePath = path.join(tsconfigDirPath, 'tsconfig.example.json');
const context = {
  index: 0,
  tsconfig: tsconfigFilePath,
};

describe('getInlineExcludedFiles', () => {
  it('comment top of file', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const source01 = `
/**
 * @maeum-file-exclude fast-maker
 */
import path from 'node:path';

/**
 * eslint-disable-next-line
 */
export default class Hero {
  #name: string;

  constructor(name: string) {
    this.#name = name;
  }
}
    `;

    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `
import path from 'node:path';

export class SuperHero {
  #name: string;

  constructor(name: string) {
    this.#name = name;
  }
}
    `;

    const project = new tsm.Project({ tsConfigFilePath: tsconfigFilePath });
    project.createSourceFile(path.join(tsconfigDirPath, filename01), source01.trim());
    project.createSourceFile(path.join(tsconfigDirPath, filename02), source02.trim());

    const excluded = getInlineExcludedFiles(project, tsconfigDirPath);

    expect(excluded).toMatchObject([
      {
        commentCode: '/**\n * @maeum-file-exclude fast-maker\n */',
        filePath: path.join(tsconfigDirPath, filename01),
        pos: {
          start: 42,
          line: 4,
          column: 1,
        },
        tag: 'maeum-file-exclude',
        workspaces: ['fast-maker'],
      },
    ]);
  });

  it('comment middle of file', () => {
    const uuid = randomUUID();
    const filename01 = `${uuid}_0${(context.index += 1)}.ts`;
    const source01 = `
import path from 'node:path';

/** I am plain comment */
export default class Hero {
  #name: string;

  constructor(name: string) {
    this.#name = name;
  }
}
    `;

    const filename02 = `${uuid}_0${(context.index += 1)}.ts`;
    const source02 = `
import path from 'node:path';

export class MarvelHero {
  #name: string;
  
  constructor(name: string) {
    this.#name = name;
  }
}

// @maeum-file-exclude fast-maker
export class DCHero {
  #name: string;

  constructor(name: string) {
    this.#name = name;
  }
}
    `;

    const project = new tsm.Project({ tsConfigFilePath: tsconfigFilePath });
    project.createSourceFile(path.join(tsconfigDirPath, filename01), source01.trim());
    project.createSourceFile(path.join(tsconfigDirPath, filename02), source02.trim());

    const excluded = getInlineExcludedFiles(project, tsconfigDirPath);

    expect(excluded).toMatchObject([
      {
        commentCode: '// @maeum-file-exclude fast-maker',
        filePath: path.join(tsconfigDirPath, filename02),
        pos: {
          start: 171,
          line: 12,
          column: 1,
        },
        tag: 'maeum-file-exclude',
        workspaces: ['fast-maker'],
      },
    ]);
  });
});
