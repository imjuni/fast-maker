import { RequestGenericInterface } from 'fastify';

export default interface IReqPokeHello extends RequestGenericInterface {
  querystring: {
    name: string;
  };
  Body: {
    weight: string;
    age: number;
  };
}
