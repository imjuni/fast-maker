export default function appendPostfixHash(name: string, hash: string): string {
  return `${name}_${hash}`;
}
