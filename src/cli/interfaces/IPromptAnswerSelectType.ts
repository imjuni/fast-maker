import type * as tsm from 'ts-morph';

export default interface IPromptAnswerSelectType {
  typeName: {
    filePath: string;
    identifier: string;
    exportedDeclaration: tsm.ExportedDeclarations;
  };
}
