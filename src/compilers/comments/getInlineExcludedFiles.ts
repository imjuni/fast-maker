import { CE_INLINE_COMMENT_KEYWORD } from '#/compilers/comments/const-enum/CE_INLINE_COMMENT_KEYWORD';
import { getInlineExclude } from '#/compilers/comments/getInlineExclude';
import { getSourceFileComments } from '#/compilers/comments/getSourceFileComments';
import type { IExcludeFile } from '#/compilers/comments/interfaces/IExcludeFile';
import type { IInlineExcludeInfo } from '#/compilers/comments/interfaces/IInlineExcludeInfo';
import { isDescendant } from 'my-node-fp';
import path from 'node:path';
import type * as tsm from 'ts-morph';
import type { SetRequired } from 'type-fest';

export function getInlineExcludedFiles(project: tsm.Project, projectDir: string) {
  const sourceFiles = project.getSourceFiles();
  const descendantFiles = sourceFiles.filter((sourceFile) =>
    isDescendant(projectDir, path.resolve(sourceFile.getFilePath().toString())),
  );
  const excluded = descendantFiles
    .map((sourceFile): IExcludeFile => {
      const sourceFileComment = getSourceFileComments(sourceFile);

      const fileExcludeComment = sourceFileComment.comments
        .map((comment) =>
          getInlineExclude({ comment, options: { keyword: CE_INLINE_COMMENT_KEYWORD.FILE_EXCLUDE_KEYWORD } }),
        )
        .filter((comment): comment is IInlineExcludeInfo => comment != null)
        .filter((comment) => comment.workspaces.includes(CE_INLINE_COMMENT_KEYWORD.FAST_MAKER_WORKSPACE));

      const firstExcludeComment = fileExcludeComment.at(0);

      return {
        filePath: sourceFile.getFilePath().toString(),
        fileExcludeComment,
        firstExcludeComment,
        excluded: firstExcludeComment != null,
      } satisfies IExcludeFile;
    })
    .filter(
      (exclude): exclude is SetRequired<IExcludeFile, 'firstExcludeComment'> =>
        exclude.firstExcludeComment != null && exclude.excluded,
    )
    .map((exclude) => {
      return {
        ...exclude.firstExcludeComment,
        filePath: exclude.filePath,
      };
    });

  return excluded;
}
