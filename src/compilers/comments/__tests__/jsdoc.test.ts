import { getJsDocComment } from '#/compilers/comments/getJsDocComment';
import { getJsDocTag } from '#/compilers/comments/getJsDocTag';
import * as tsm from 'ts-morph';
import { describe, expect, it } from 'vitest';

describe('getJsDocTag', () => {
  it('plain string', () => {
    const r01 = getJsDocTag('test');
    expect(r01).toEqual('test');
  });

  it('trim applied', () => {
    const r01 = getJsDocTag(' test');
    const r02 = getJsDocTag('test ');
    const r03 = getJsDocTag(' test ');

    expect(r01).toEqual('test');
    expect(r02).toEqual('test');
    expect(r03).toEqual('test');
  });

  it('remove @ character', () => {
    const r01 = getJsDocTag('@test');
    expect(r01).toEqual('test');
  });
});

describe('getJsDocComment', () => {
  it('single line comment trivia', () => {
    const r01 = getJsDocComment(tsm.SyntaxKind.SingleLineCommentTrivia, '// test');
    expect(r01).toEqual('/** test */');
  });

  it('triple slash comment', () => {
    const r01 = getJsDocComment(tsm.SyntaxKind.SingleLineCommentTrivia, '/// test');
    expect(r01).toEqual('/** test */');
  });

  it('multiple line comment', () => {
    const r01 = getJsDocComment(tsm.SyntaxKind.MultiLineCommentTrivia, '/* test */');
    expect(r01).toEqual('/** test */');
  });

  it('multiple line and document comment', () => {
    const r01 = getJsDocComment(tsm.SyntaxKind.MultiLineCommentTrivia, '/** test */');
    expect(r01).toEqual('/** test */');
  });
});
