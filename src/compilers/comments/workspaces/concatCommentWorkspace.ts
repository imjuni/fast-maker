export function concatCommentWorkspace(tag?: { name?: string; description?: string }): string {
  const name = tag?.name ?? '';
  const description = tag?.description ?? '';
  const concated = [name, description].filter((element) => element !== '').join(' ');
  return concated;
}
