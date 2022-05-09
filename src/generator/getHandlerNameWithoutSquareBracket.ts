export default function getHandlerNameWithoutSquareBracket(handler: string): string {
  const withoutSquareBracket = handler.replace(/(\[)(.+)(\])/, '$2');
  return withoutSquareBracket;
}
