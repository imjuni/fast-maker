import type { FastifyReply } from 'fastify';
import type { IAbility } from '../../../interface/IAbility';
import type ICompany from '../../../interface/ICompany';
import type TAbnormalPreent from '../../../interface/TAbnormalPresident';
import type { IReqPokeHello } from '../../interfaces/IReqPokeHello';

export async function handler(
  req: {
    querystring: IReqPokeHello['querystring'];
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
  console.debug(req.querystring);
  console.debug(req.Body);

  return 'hello';
}
