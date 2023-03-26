import * as env from '#tools/__tests__/tools/env';
import posixJoin from '#tools/posixJoin';

export default {
  get: [
    {
      method: 'get',
      filePath: posixJoin(env.handlerPath, 'get/justice/[dc-league]/hello.ts'),
      handlerPath: 'get/justice/[dc-league]/hello.ts',
    },
    {
      method: 'get',
      filePath: posixJoin(env.handlerPath, 'get/justice/[kind]-[id]/hello.ts'),
      handlerPath: 'get/justice/[kind]-[id]/hello.ts',
    },
    {
      method: 'get',
      filePath: posixJoin(env.handlerPath, 'get/justice/world/[id].ts'),
      handlerPath: 'get/justice/world/[id].ts',
    },
    {
      method: 'get',
      filePath: posixJoin(env.handlerPath, 'get/xman/fastify.ts'),
      handlerPath: 'get/xman/fastify.ts',
    },
    {
      method: 'get',
      filePath: posixJoin(env.handlerPath, 'get/xman/world.ts'),
      handlerPath: 'get/xman/world.ts',
    },
  ],
  post: [
    {
      method: 'post',
      filePath: posixJoin(env.handlerPath, 'post/justice/[dc-league]/world.ts'),
      handlerPath: 'post/justice/[dc-league]/world.ts',
    },
  ],
  put: [
    {
      method: 'put',
      filePath: posixJoin(env.handlerPath, 'put/po-ke/world.ts'),
      handlerPath: 'put/po-ke/world.ts',
    },
  ],
  delete: [
    {
      method: 'delete',
      filePath: posixJoin(env.handlerPath, 'delete/justice/world.ts'),
      handlerPath: 'delete/justice/world.ts',
    },
  ],
  options: [
    {
      method: 'options',
      filePath: posixJoin(env.handlerPath, 'options/xman/hello.ts'),
      handlerPath: 'options/xman/hello.ts',
    },
  ],
  head: [
    {
      method: 'head',
      filePath: posixJoin(env.handlerPath, 'head/xman/world.ts'),
      handlerPath: 'head/xman/world.ts',
    },
  ],
  patch: [
    {
      method: 'patch',
      filePath: posixJoin(env.handlerPath, 'patch/justice/world.ts'),
      handlerPath: 'patch/justice/world.ts',
    },
  ],
  all: [
    {
      method: 'all',
      filePath: posixJoin(env.handlerPath, 'all/po-ke/hello.ts'),
      handlerPath: 'all/po-ke/hello.ts',
    },
  ],
};
