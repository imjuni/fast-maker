import { getJsDocComment } from '#/compilers/comments/getJsDocComment';
import { getJsDocTag } from '#/compilers/comments/getJsDocTag';
import type { IInlineExcludeInfo } from '#/compilers/comments/interfaces/IInlineExcludeInfo';
import type { IStatementComments } from '#/compilers/comments/interfaces/IStatementComments';
import { concatCommentWorkspace } from '#/compilers/comments/workspaces/concatCommentWorkspace';
import { getCommentWorkspaces } from '#/compilers/comments/workspaces/getCommentWorkspaces';
import { parse } from 'comment-parser';

export function getInlineExclude(params: {
  comment: IStatementComments;
  options: { keyword: string };
}): IInlineExcludeInfo | undefined {
  const content = params.comment.range;
  const refined = getJsDocComment(params.comment.kind, content);
  const blocks = parse(refined);
  const block = blocks.at(0);

  if (block == null) {
    return undefined;
  }

  const tag = block.tags.find((element) => element.tag === getJsDocTag(params.options.keyword));

  if (tag?.tag === params.options.keyword || tag?.tag === params.options.keyword.substring(1)) {
    return {
      commentCode: content,
      filePath: params.comment.filePath,
      pos: params.comment.pos,
      tag: tag.tag,
      workspaces: getCommentWorkspaces(concatCommentWorkspace(tag)),
    } satisfies IInlineExcludeInfo;
  }

  return undefined;
}
