import { RequestGenericInterface } from 'fastify';

export default interface IReqPokeHelloMultiParam extends RequestGenericInterface {
  querystring: {
    name: string;
  };
  Param: {
    kind: string;
    id: string;
  };
  Body: {
    weight: string;
    age: number;
  };
}
