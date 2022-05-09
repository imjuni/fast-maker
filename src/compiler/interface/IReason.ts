import * as tsm from 'ts-morph';

export default interface IReason {
  type: 'error' | 'warn';
  lineAndCharacter?: tsm.ts.LineAndCharacter;
  filePath: string;
  source?: tsm.SourceFile;
  node?: tsm.Node;
  message: string;
}
