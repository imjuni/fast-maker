import { FastifyReply } from 'fastify';
import { IAbility } from '../../../interface/IAbility';
import ICompany from '../../../interface/ICompany';
import TAbnormalPreent from '../../../interface/TAbnormalPresident';
import IReqPokeHello from '../interface/IReqPokeHello';

export default async function world(
  req: {
    query: IReqPokeHello['querystring'];
    body:
      | IReqPokeHello['Body']
      | {
          help: TAbnormalPreent;
          company: ICompany;
          ability: IAbility;
        };
    headers: {
      'access-token': string;
      'refresh-token': string;
      kind: { name: 'develop' } & { name: 'prod' } & { name: ICompany };
      'expire-time': {
        token: string | number | boolean;
        expire: number;
        site: {
          host: string;
          port: number;
        };
      };
    };
  },
  _reply: FastifyReply,
) {
  console.debug(req.query);
  console.debug(req.body);

  return 'hello';
}
