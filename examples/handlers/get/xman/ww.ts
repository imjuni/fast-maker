import { FastifyReply, FastifyRequest } from 'fastify';
import { ITestInfoType01, ITestInfoType02 } from 'interface/ITestInfo';
import { IAbility } from '../../../interface/IAbility';
import ICompany from '../../../interface/ICompany';
import TAbnormalPreent from '../../../interface/TAbnormalPresident';
import IReqPokeHello from '../interface/IReqPokeHello';

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
  console.debug(req.querystring);
  console.debug(req.Body);

  return 'hello';
}
