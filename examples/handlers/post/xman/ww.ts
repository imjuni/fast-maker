import { FastifyReply, FastifyRequest } from 'fastify';
import { IAbility } from '../../../interface/IAbility';
import type ICompany from '../../../interface/ICompany';
import { ITestInfoType01, ITestInfoType02 } from '../../../interface/ITestInfo';
import type TAbnormalPreent from '../../../interface/TAbnormalPresident';
import type IReqPokeHello from '../../get/interface/IReqPokeHello';

export default async function ww(
  req: FastifyRequest<{
    Querystring: ITestInfoType01;
    Body:
      | IReqPokeHello['Body']
      | {
          help: TAbnormalPreent;
          company: ICompany;
          ability: IAbility;
        };
    Headers: {
      'access-token': string;
      'refresh-token': string;
    } & ITestInfoType02;
  }>,
  _reply: FastifyReply,
) {
  console.debug(req.query);
  console.debug(req.body);

  return 'hello';
}
