import type { IInlineExcludeInfo } from '#/compilers/comments/interfaces/IInlineExcludeInfo';

export interface IExcludeFile {
  filePath: string;
  fileExcludeComment: IInlineExcludeInfo[];
  firstExcludeComment?: IInlineExcludeInfo;
  excluded: boolean;
}
