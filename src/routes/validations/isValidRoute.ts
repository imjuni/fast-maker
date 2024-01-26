export function isValidRoute(method: string): boolean {
  switch (method) {
    // 모든 HTTP Method를 지원하는 fastify.all 함수를 사용하기 위한 것으로, 올바른 method는 아님
    case 'ALL':
    case 'all':
      return true;
    default:
      return false;
  }
}
