import { replaceSepToPosix } from 'my-node-fp';
import path from 'path';

export default function posixJoin(...args: string[]): string {
  return replaceSepToPosix(path.join(...args));
}
