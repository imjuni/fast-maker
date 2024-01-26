import type { Node, SourceFile } from 'ts-morph';
import type { LineAndCharacter } from 'typescript';

export interface IReason {
  type: 'error' | 'warn';
  lineAndCharacter?: LineAndCharacter;
  filePath: string;
  source?: SourceFile;
  node?: Node;
  message: string;
}
