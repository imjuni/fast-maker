import { IAbility } from './IAbility';
import ICompany from './ICompany';

export default interface IPresident {
  query: {
    name: string;
    address: string;
    since: number;
  };
  body: {
    ability: IAbility;
    company: ICompany;
  };
}
