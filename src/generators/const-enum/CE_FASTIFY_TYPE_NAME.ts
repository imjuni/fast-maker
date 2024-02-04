export const CE_FASTIFY_TYPE_NAME = {
  FASTIFY_MODULE: 'fastify',
  FASTIFY_REQUEST: 'FastifyRequest',
  FASTIFY_INSTANCE: 'FastifyInstance',
} as const;

export type CE_FASTIFY_TYPE_NAME = (typeof CE_FASTIFY_TYPE_NAME)[keyof typeof CE_FASTIFY_TYPE_NAME];
