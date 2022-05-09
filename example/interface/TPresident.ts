import { IAbility } from './IAbility';
import ICompany from './ICompany';

type TPresident = {
  query: {
    name: string;
    address: string;
    since: number;
  };
  body: {
    ability: IAbility;
    company: ICompany;
  };
};

export default TPresident;
