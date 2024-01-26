import type { RequestGenericInterface } from 'fastify';

export interface IReqPokeHello extends RequestGenericInterface {
  querystring: {
    name: string;
  };
  Body: {
    weight: string;
    age: number;
  };
}
