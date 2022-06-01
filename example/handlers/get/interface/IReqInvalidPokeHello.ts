import { RequestGenericInterface } from 'fastify';

export default interface IReqInvalidPokeHello extends RequestGenericInterface {
  querystring: {
    name: string;
  };
  Bodi: {
    weight: string;
    age: number;
  };
}
