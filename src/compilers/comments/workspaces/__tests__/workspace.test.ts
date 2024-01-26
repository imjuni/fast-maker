import { concatCommentWorkspace } from '#/compilers/comments/workspaces/concatCommentWorkspace';
import { getCommentWorkspace } from '#/compilers/comments/workspaces/getCommentWorkspace';
import { getCommentWorkspaces } from '#/compilers/comments/workspaces/getCommentWorkspaces';
import { describe, expect, it } from 'vitest';

describe('concatCommentWorkspace', () => {
  it('filled object', () => {
    const r01 = concatCommentWorkspace({ name: 'a', description: 'b' });
    expect(r01).toEqual('a b');
  });

  it('only name', () => {
    const r01 = concatCommentWorkspace({ name: 'a' });
    expect(r01).toEqual('a');
  });

  it('only description', () => {
    const r01 = concatCommentWorkspace({ description: 'b' });
    expect(r01).toEqual('b');
  });

  it('empty object', () => {
    const r01 = concatCommentWorkspace({});
    const r02 = concatCommentWorkspace();
    expect(r01).toEqual('');
    expect(r02).toEqual('');
  });
});

describe('getCommentWorkspace', () => {
  it('plain workspace', () => {
    const r01 = getCommentWorkspace('workspace');
    expect(r01).toEqual('workspace');
  });

  it('trimed workspace', () => {
    const r01 = getCommentWorkspace('  workspace');
    const r02 = getCommentWorkspace('workspace  ');
    const r03 = getCommentWorkspace('  workspace  ');

    expect(r01).toEqual('workspace');
    expect(r02).toEqual('workspace');
    expect(r03).toEqual('workspace');
  });

  it('with comma workspace', () => {
    const r01 = getCommentWorkspace('workspace  ,');
    expect(r01).toEqual('workspace  ');
  });
});

describe('getCommentWorkspaces', () => {
  it('undefined workspaces', () => {
    const r01 = getCommentWorkspaces();
    expect(r01).toMatchObject([]);
  });

  it('empty string workspaces', () => {
    const r01 = getCommentWorkspaces('');
    expect(r01).toMatchObject([]);
  });

  it('multiple workspaces', () => {
    const r01 = getCommentWorkspaces('apple orange peach');
    expect(r01).toMatchObject(['apple', 'orange', 'peach']);
  });

  it('multiple, comma separated workspaces', () => {
    const r01 = getCommentWorkspaces('apple, orange, peach');
    expect(r01).toMatchObject(['apple', 'orange', 'peach']);
  });
});
