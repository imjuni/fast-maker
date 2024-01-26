import { getCommentWorkspace } from '#/compilers/comments/workspaces/getCommentWorkspace';

export function getCommentWorkspaces(rawWorkspace?: string): string[] {
  if (rawWorkspace == null || rawWorkspace === '') {
    return [];
  }

  return rawWorkspace
    .split(/\s/)
    .filter((workspace) => workspace != null && workspace !== '')
    .map((workspace) => getCommentWorkspace(workspace));
}
