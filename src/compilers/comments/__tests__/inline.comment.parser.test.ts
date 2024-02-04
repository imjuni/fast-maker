import { CE_INLINE_COMMENT_KEYWORD } from '#/compilers/comments/const-enum/CE_INLINE_COMMENT_KEYWORD';
import { getCommentKind } from '#/compilers/comments/getCommentKind';
import { getInlineExclude } from '#/compilers/comments/getInlineExclude';
import { getSourceFileComments } from '#/compilers/comments/getSourceFileComments';
import type { IStatementComments } from '#/compilers/comments/interfaces/IStatementComments';
import * as cp from 'comment-parser';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import * as tsm from 'ts-morph';
import { describe, expect, it, vi } from 'vitest';

const tsconfigPath = path.join(process.cwd(), 'examples', 'tsconfig.example.json');
const context = {
  tsconfig: tsconfigPath,
  project: new tsm.Project({
    tsConfigFilePath: tsconfigPath,
  }),
};

vi.mock('comment-parser', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const mod = await importOriginal<typeof import('comment-parser')>();
  return {
    ...mod,
  };
});

describe('getCommentKind', () => {
  it('pass', () => {
    const r01 = getCommentKind(tsm.SyntaxKind.MultiLineCommentTrivia);
    const r02 = getCommentKind(tsm.SyntaxKind.SingleLineCommentTrivia);
    const r03 = getCommentKind(tsm.SyntaxKind.NewLineTrivia);

    expect(r01).toEqual(tsm.SyntaxKind.MultiLineCommentTrivia);
    expect(r02).toEqual(tsm.SyntaxKind.SingleLineCommentTrivia);
    expect(r03).toEqual(tsm.SyntaxKind.SingleLineCommentTrivia);
  });
});

describe('getSourceFileComments', () => {
  it('inline comment by multiple line document comment', () => {
    const uuid = randomUUID();
    const filename = `${uuid}.ts`;
    const source = `
/**
 * @route-file-exclude
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

    const sourceFile = context.project.createSourceFile(filename, source.trim());
    const comments = getSourceFileComments(sourceFile);

    expect(comments).toMatchObject({
      filePath: path.join(process.cwd(), filename),
      comments: [
        { kind: tsm.SyntaxKind.MultiLineCommentTrivia, pos: { column: 1, line: 4, start: 31 } },
        { kind: tsm.SyntaxKind.MultiLineCommentTrivia, pos: { column: 1, line: 9, start: 98 } },
      ],
    });
  });

  it('inline comment by multiple line comment', () => {
    const uuid = randomUUID();
    const filename = `${uuid}.ts`;
    const source = `
/*
 * @route-file-exclude
 */
import path from 'node:path';

/*
 * elint-disable-next-line
 */
export default class Hero {
  #name: string;

  constructor(name: string) {
    this.#name = name;
  }
}
    `;

    const sourceFile = context.project.createSourceFile(filename, source.trim());
    const comments = getSourceFileComments(sourceFile);

    expect(comments).toMatchObject({
      filePath: path.join(process.cwd(), filename),
      comments: [
        { kind: tsm.SyntaxKind.MultiLineCommentTrivia, pos: { column: 1, line: 4, start: 30 } },
        { kind: tsm.SyntaxKind.MultiLineCommentTrivia, pos: { column: 1, line: 9, start: 95 } },
      ],
    });
  });

  it('inline comment by single line document comment', () => {
    const uuid = randomUUID();
    const filename = `${uuid}.ts`;
    const source = `
// @route-file-exclude
import path from 'node:path';

// eslint-disable-next-line
export default class Hero {
  #name: string;

  constructor(name: string) {
    this.#name = name;
  }
}
    `;

    const sourceFile = context.project.createSourceFile(filename, source.trim());
    const comments = getSourceFileComments(sourceFile);

    expect(comments).toMatchObject({
      filePath: path.join(process.cwd(), filename),
      comments: [
        { kind: tsm.SyntaxKind.SingleLineCommentTrivia, pos: { column: 1, line: 2, start: 23 } },
        { kind: tsm.SyntaxKind.SingleLineCommentTrivia, pos: { column: 1, line: 5, start: 82 } },
      ],
    });
  });

  it('inline comment by multiple line triple slash comment', () => {
    const uuid = randomUUID();
    const filename = `${uuid}.ts`;
    const source = `
/// @route-file-exclude
import path from 'node:path';

/// eslint-disable-next-line
export default class Hero {
  #name: string;

  constructor(name: string) {
    this.#name = name;
  }
}
    `;

    const sourceFile = context.project.createSourceFile(filename, source.trim());
    const comments = getSourceFileComments(sourceFile);

    expect(comments).toMatchObject({
      filePath: path.join(process.cwd(), filename),
      comments: [
        { kind: tsm.SyntaxKind.SingleLineCommentTrivia, pos: { column: 1, line: 2, start: 24 } },
        { kind: tsm.SyntaxKind.SingleLineCommentTrivia, pos: { column: 1, line: 5, start: 84 } },
      ],
    });
  });
});

describe('getInlineExclude', () => {
  it('document comment string, no namespace', () => {
    const uuid = randomUUID();
    const filename = `${uuid}.ts`;
    const comment: IStatementComments = {
      kind: tsm.SyntaxKind.MultiLineCommentTrivia,
      pos: {
        line: 1,
        column: 1,
        start: 1,
      },
      filePath: path.join(process.cwd(), filename),
      range: '/**\n * @route-file-exclude\n */',
    };

    const r01 = getInlineExclude({
      comment,
      options: {
        keyword: CE_INLINE_COMMENT_KEYWORD.FILE_EXCLUDE_KEYWORD,
      },
    });

    expect(r01).toMatchObject({
      commentCode: '/**\n * @route-file-exclude\n */',
      filePath: path.join(process.cwd(), filename),
      tag: 'route-file-exclude',
      pos: {
        line: 1,
        column: 1,
        start: 1,
      },
      workspaces: [],
    });
  });

  it('multiline comment string, no namespace', () => {
    const uuid = randomUUID();
    const filename = `${uuid}.ts`;
    const comment: IStatementComments = {
      kind: tsm.SyntaxKind.MultiLineCommentTrivia,
      pos: {
        line: 2,
        column: 2,
        start: 2,
      },
      filePath: path.join(process.cwd(), filename),
      range: '/*\n\n * @route-file-exclude\n */',
    };

    const r01 = getInlineExclude({
      comment,
      options: {
        keyword: CE_INLINE_COMMENT_KEYWORD.FILE_EXCLUDE_KEYWORD,
      },
    });

    expect(r01).toMatchObject({
      commentCode: '/*\n\n * @route-file-exclude\n */',
      filePath: path.join(process.cwd(), filename),
      tag: 'route-file-exclude',
      pos: {
        line: 2,
        column: 2,
        start: 2,
      },
      workspaces: [],
    });
  });

  it('multiline document comment string, no namespace, last line', () => {
    const uuid = randomUUID();
    const filename = `${uuid}.ts`;
    const range = [
      `/**\n * @class\n * @name BlendEffect\n * @classdesc Blends the input render target with another texture.\n * @description Creates new instance of the post effect.`,
      `\n * @augments PostEffect\n * @param {GraphicsDevice} graphicsDevice - The graphics device of the application.`,
      `\n * @property {Texture} blendMap The texture with which to blend the input render target with.`,
      `\n * @property {number} mixRatio The amount of blending between the input and the blendMap. Ranges from 0 to 1.`,
      `\n *\n * @route-file-exclude\n */`,
    ].join('');
    const comment: IStatementComments = {
      kind: tsm.SyntaxKind.MultiLineCommentTrivia,
      pos: {
        line: 3,
        column: 3,
        start: 3,
      },
      filePath: path.join(process.cwd(), filename),
      range,
    };

    const r01 = getInlineExclude({
      comment,
      options: {
        keyword: CE_INLINE_COMMENT_KEYWORD.FILE_EXCLUDE_KEYWORD,
      },
    });

    expect(r01).toMatchObject({
      commentCode: range,
      tag: 'route-file-exclude',
      pos: {
        line: 3,
        column: 3,
        start: 3,
      },
      filePath: path.join(process.cwd(), filename),
      workspaces: [],
    });
  });

  it('multiline document comment string, no namespace, first line', () => {
    const uuid = randomUUID();
    const filename = `${uuid}.ts`;
    const range = [
      `/**\n * @route-file-exclude\n * @class\n * @name BlendEffect\n * @classdesc Blends the input render target with another texture.\n * @description Creates new instance of the post effect.`,
      `\n * @augments PostEffect\n * @param {GraphicsDevice} graphicsDevice - The graphics device of the application.`,
      `\n * @property {Texture} blendMap The texture with which to blend the input render target with.`,
      `\n * @property {number} mixRatio The amount of blending between the input and the blendMap. Ranges from 0 to 1.`,
      `\n */`,
    ].join('');
    const comment: IStatementComments = {
      kind: tsm.SyntaxKind.MultiLineCommentTrivia,
      pos: {
        line: 4,
        column: 4,
        start: 4,
      },
      filePath: path.join(process.cwd(), filename),
      range,
    };

    const r01 = getInlineExclude({
      comment,
      options: {
        keyword: CE_INLINE_COMMENT_KEYWORD.FILE_EXCLUDE_KEYWORD,
      },
    });

    expect(r01).toMatchObject({
      commentCode: range,
      tag: 'route-file-exclude',
      pos: {
        line: 4,
        column: 4,
        start: 4,
      },
      filePath: path.join(process.cwd(), filename),
      workspaces: [],
    });
  });

  it('multiline document comment string, single namespace, first line', () => {
    const uuid = randomUUID();
    const filename = `${uuid}.ts`;
    const range = [
      `/**\n * @class\n * @name BlendEffect\n * @classdesc Blends the input render target with another texture.\n * @description Creates new instance of the post effect.`,
      `\n * @augments PostEffect\n * @param {GraphicsDevice} graphicsDevice - The graphics device of the application.`,
      `\n * @property {Texture} blendMap The texture with which to blend the input render target with.`,
      `\n * @property {number} mixRatio The amount of blending between the input and the blendMap. Ranges from 0 to 1.`,
      `\n *\n * @route-file-exclude i-am-ironman\n */`,
    ].join('');
    const comment: IStatementComments = {
      kind: tsm.SyntaxKind.MultiLineCommentTrivia,
      pos: {
        line: 5,
        column: 5,
        start: 5,
      },
      filePath: path.join(process.cwd(), filename),
      range,
    };

    const r01 = getInlineExclude({
      comment,
      options: {
        keyword: CE_INLINE_COMMENT_KEYWORD.FILE_EXCLUDE_KEYWORD,
      },
    });

    expect(r01).toMatchObject({
      commentCode: range,
      tag: 'route-file-exclude',
      pos: {
        line: 5,
        column: 5,
        start: 5,
      },
      filePath: path.join(process.cwd(), filename),
      workspaces: ['i-am-ironman'],
    });
  });

  it('multiline document comment string, multiple namespace, first line', () => {
    const uuid = randomUUID();
    const filename = `${uuid}.ts`;
    const range = [
      `/**\n * @class\n * @name BlendEffect\n * @classdesc Blends the input render target with another texture.\n * @description Creates new instance of the post effect.`,
      `\n * @augments PostEffect\n * @param {GraphicsDevice} graphicsDevice - The graphics device of the application.`,
      `\n * @property {Texture} blendMap The texture with which to blend the input render target with.`,
      `\n * @property {number} mixRatio The amount of blending between the input and the blendMap. Ranges from 0 to 1.`,
      `\n *\n * @route-file-exclude i-am-ironman, i-am-marvel\n */`,
    ].join('');
    const comment: IStatementComments = {
      kind: tsm.SyntaxKind.MultiLineCommentTrivia,
      pos: {
        line: 6,
        column: 6,
        start: 6,
      },
      filePath: path.join(process.cwd(), filename),
      range,
    };

    const r01 = getInlineExclude({
      comment,
      options: {
        keyword: CE_INLINE_COMMENT_KEYWORD.FILE_EXCLUDE_KEYWORD,
      },
    });

    expect(r01).toMatchObject({
      commentCode: range,
      tag: 'route-file-exclude',
      pos: {
        line: 6,
        column: 6,
        start: 6,
      },
      filePath: path.join(process.cwd(), filename),
      workspaces: ['i-am-ironman', 'i-am-marvel'],
    });
  });

  it('multiline statement comment string, no namespace', () => {
    const uuid = randomUUID();
    const filename = `${uuid}.ts`;
    const range = '/** @route-file-exclude */';
    const comment: IStatementComments = {
      kind: tsm.SyntaxKind.MultiLineCommentTrivia,
      pos: {
        line: 7,
        column: 7,
        start: 7,
      },
      filePath: path.join(process.cwd(), filename),
      range,
    };

    const r01 = getInlineExclude({
      comment,
      options: {
        keyword: CE_INLINE_COMMENT_KEYWORD.FILE_EXCLUDE_KEYWORD,
      },
    });

    expect(r01).toMatchObject({
      commentCode: range,
      tag: 'route-file-exclude',
      pos: {
        line: 7,
        column: 7,
        start: 7,
      },
      filePath: path.join(process.cwd(), filename),
      workspaces: [],
    });
  });

  it('multiline statement comment string, no namespace', () => {
    const uuid = randomUUID();
    const filename = `${uuid}.ts`;
    const comment: IStatementComments = {
      kind: tsm.SyntaxKind.MultiLineCommentTrivia,
      pos: {
        line: 8,
        column: 8,
        start: 8,
      },
      filePath: path.join(process.cwd(), filename),
      range: '/** not comment */',
    };

    const r01 = getInlineExclude({
      comment,
      options: {
        keyword: CE_INLINE_COMMENT_KEYWORD.FILE_EXCLUDE_KEYWORD,
      },
    });

    expect(r01).toBeUndefined();
  });

  it('empty comment block', () => {
    const spy = vi.spyOn(cp, 'parse');
    const spyH01 = spy.mockImplementation(() => {
      return [];
    });

    const uuid = randomUUID();
    const filename = `${uuid}.ts`;
    const comment: IStatementComments = {
      kind: tsm.SyntaxKind.MultiLineCommentTrivia,
      pos: {
        line: 8,
        column: 8,
        start: 8,
      },
      filePath: path.join(process.cwd(), filename),
      range: '/** not comment */',
    };

    const r01 = getInlineExclude({
      comment,
      options: {
        keyword: CE_INLINE_COMMENT_KEYWORD.FILE_EXCLUDE_KEYWORD,
      },
    });

    spyH01.mockRestore();

    expect(r01).toBeUndefined();
  });
});
