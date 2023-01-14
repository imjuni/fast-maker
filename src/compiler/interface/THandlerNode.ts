import type { Node } from 'ts-morph';

export interface IHandlerStatement {
  kind: 'handler';
  type: 'async' | 'sync';
  node: Node;
  name: string;
}

export interface IOptionStatement {
  kind: 'option';
  node: Node;
}

type THandlerNode = IHandlerStatement | IOptionStatement;

export type THandlerWithoutNode = Omit<IHandlerStatement, 'node'> | Omit<IOptionStatement, 'node'>;

export default THandlerNode;
