import type { FastifyInstance } from 'fastify';
import { type IAbility } from '../interface/IAbility';
import type ICompany_6bwarMss36QHeqUXTVMxB9uAjEjVZOL1 from '../interface/ICompany';
import type TAbnormalPresident_DS8Pg2MYm5AsqoJVltiuqlOctGQfT78w from '../interface/TAbnormalPresident';
import hello_JBEumYWpspHJFAhjbctT6IF9XOfwQ0fj from './delete/hello';
import type IReqInvalidPokeHello_pkGeCRajiEMsgv1cIlWYRF5QNEfw9iTk from './get/interface/IReqInvalidPokeHello';
import type IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE from './get/interface/IReqPokeHello';
import type IReqPokeHelloMultiParam_IUJdqYZad58l0NVdUoCkaSNZytYdE5Wd from './get/interface/IReqPokeHelloMultiParam';
import world_Ua8WhawDaNixVgbF2am4uJt9QPFcfmcd, {
  option as option_Ua8WhawDaNixVgbF2am4uJt9QPFcfmcd,
} from './get/justice/world';
import world_7oyxIuopp2OGQ5hJAGyXWqu2Nx8GXdiv, {
  option as option_7oyxIuopp2OGQ5hJAGyXWqu2Nx8GXdiv,
} from './get/justice/world/[id]';
import hello_pGVJC0cPxPAmRzGikdeTeu68wBLFxWHz, {
  option as option_pGVJC0cPxPAmRzGikdeTeu68wBLFxWHz,
} from './get/justice/[dc-league]/hello';
import world_BvbnzoJqvrvO4vqapZSyggVC8BwnCLHI, {
  option as option_BvbnzoJqvrvO4vqapZSyggVC8BwnCLHI,
} from './get/justice/[dc-league]/world';
import hello_Yf7vKXyrVoFk9m0Z1WstNIrdqpWGeVsT, {
  option as option_Yf7vKXyrVoFk9m0Z1WstNIrdqpWGeVsT,
} from './get/justice/[kind]-[id]/hello';
import hello_9dGSkUiBmIpX8YgvC1QfcqpBSAPSJ3lJ, {
  option as option_9dGSkUiBmIpX8YgvC1QfcqpBSAPSJ3lJ,
} from './get/po-ke/hello';
import world_JtjNeTmnZUEK9hGizx8AvZ0BeWmAi5oQ, {
  option as option_JtjNeTmnZUEK9hGizx8AvZ0BeWmAi5oQ,
} from './get/po-ke/world';
import fastify_QzzNAbc0AmKoQMNvlQY3EREIwKgCpwrW, {
  option as option_QzzNAbc0AmKoQMNvlQY3EREIwKgCpwrW,
} from './get/xman/fastify';
import world_T6h0XVQhU3SHYVi61Tv3RN9NTig7oSjB from './get/xman/world';
import heros_PDq0q2qANIHiZy5vU3VeCgIYyT8mERjU from './post/avengers/heros';
import hero_RuJhK1HdMHVoXRwjngZsoOqz0jiZsLoE from './post/avengers/heros/[id]/hero';
import iamhello_2g5tCoyeRB5Sw5KVvgrn1cSAQPntZfZe from './post/hello2';
import hello_NUMfbXzJqQqF6X6atql8X2hAZeAjTM6R from './put/hello';

export default function routing(fastify: FastifyInstance): void {
  fastify.get<IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE>(
    '/justice/:dc-league/hello',
    option_pGVJC0cPxPAmRzGikdeTeu68wBLFxWHz,
    hello_pGVJC0cPxPAmRzGikdeTeu68wBLFxWHz,
  );
  fastify.get<IReqInvalidPokeHello_pkGeCRajiEMsgv1cIlWYRF5QNEfw9iTk>(
    '/justice/:dc-league/world',
    option_BvbnzoJqvrvO4vqapZSyggVC8BwnCLHI,
    world_BvbnzoJqvrvO4vqapZSyggVC8BwnCLHI,
  );
  fastify.get<IReqPokeHelloMultiParam_IUJdqYZad58l0NVdUoCkaSNZytYdE5Wd>(
    '/justice/:kind-:id/hello',
    option_Yf7vKXyrVoFk9m0Z1WstNIrdqpWGeVsT,
    hello_Yf7vKXyrVoFk9m0Z1WstNIrdqpWGeVsT,
  );
  fastify.get<IReqInvalidPokeHello_pkGeCRajiEMsgv1cIlWYRF5QNEfw9iTk>(
    '/justice/world/:id',
    option_7oyxIuopp2OGQ5hJAGyXWqu2Nx8GXdiv,
    world_7oyxIuopp2OGQ5hJAGyXWqu2Nx8GXdiv,
  );
  fastify.get<{
    Querysting: IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE['querystring'];
    Body: IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE['Body'];
    Headers: {
      'access-token': string;
      'refresh-token': string;
      'expire-time': {
        token: string;
        expire: number;
        site: {
          host: string;
          port: number;
        };
      };
    };
  }>('/justice/world', option_Ua8WhawDaNixVgbF2am4uJt9QPFcfmcd, world_Ua8WhawDaNixVgbF2am4uJt9QPFcfmcd);
  fastify.get<IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE>(
    '/po-ke/hello',
    option_9dGSkUiBmIpX8YgvC1QfcqpBSAPSJ3lJ,
    hello_9dGSkUiBmIpX8YgvC1QfcqpBSAPSJ3lJ,
  );
  fastify.get<{
    Querystring: IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE['querystring'];
    Body: IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE['Body'];
    Headers: {
      'access-token': string;
      'refresh-token': string;
      'expire-time': {
        token: string;
        expire: number;
        site: {
          host: string;
          port: number;
        };
      };
    };
  }>('/po-ke/world', option_JtjNeTmnZUEK9hGizx8AvZ0BeWmAi5oQ, world_JtjNeTmnZUEK9hGizx8AvZ0BeWmAi5oQ);
  fastify.get<IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE>(
    '/xman/fastify',
    option_QzzNAbc0AmKoQMNvlQY3EREIwKgCpwrW,
    fastify_QzzNAbc0AmKoQMNvlQY3EREIwKgCpwrW,
  );
  fastify.get<{
    querystring: IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE['querystring'];
    Body:
      | IReqPokeHello_SynyPSafLHaoobLmnZXzP70l78QG5PfE['Body']
      | {
          help: TAbnormalPresident_DS8Pg2MYm5AsqoJVltiuqlOctGQfT78w;
          company: ICompany_6bwarMss36QHeqUXTVMxB9uAjEjVZOL1;
          ability: IAbility;
        };
    Headers: {
      'access-token': string;
      'refresh-token': string;
      kind: { name: 'develop' } & { name: 'prod' } & { name: ICompany_6bwarMss36QHeqUXTVMxB9uAjEjVZOL1 };
      'expire-time': {
        token: string | number | boolean;
        expire: number;
        site: {
          host: string;
          port: number;
        };
      };
    };
  }>('/xman/world', world_T6h0XVQhU3SHYVi61Tv3RN9NTig7oSjB);
  fastify.post<{ Body: IAbility }>('/avengers/heros/:id/hero', hero_RuJhK1HdMHVoXRwjngZsoOqz0jiZsLoE);
  fastify.post('/avengers/heros', heros_PDq0q2qANIHiZy5vU3VeCgIYyT8mERjU);
  fastify.post('/hello2', iamhello_2g5tCoyeRB5Sw5KVvgrn1cSAQPntZfZe);
  fastify.put('/hello', hello_NUMfbXzJqQqF6X6atql8X2hAZeAjTM6R);
  fastify.delete('/hello', hello_JBEumYWpspHJFAhjbctT6IF9XOfwQ0fj);
}
