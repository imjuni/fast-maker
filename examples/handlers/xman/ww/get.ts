import type { FastifyReply, FastifyRequest } from 'fastify';
import type { ITestInfoType01, ITestInfoType02 } from 'interface/ITestInfo';
import type { IAbility } from '../../../interface/IAbility';
import type ICompany from '../../../interface/ICompany';
import type TAbnormalPreent from '../../../interface/TAbnormalPresident';
import type { IReqPokeHello } from '../../interfaces/IReqPokeHello';

export async function ww(
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
