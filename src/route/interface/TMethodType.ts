import type { FastifyInstance } from 'fastify';

type TMethodType = Extract<
  keyof FastifyInstance,
  'get' | 'post' | 'put' | 'delete' | 'options' | 'head' | 'patch' | 'all'
>;

export default TMethodType;
