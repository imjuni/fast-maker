import type { IStatementComments } from '#/compilers/comments/interfaces/IStatementComments';

export interface ISourceFileComments {
  filePath: string;
  comments: IStatementComments[];
}
